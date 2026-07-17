import {
  SHIPROCKET_BASE_URL,
  SHIPROCKET_EMAIL,
  SHIPROCKET_PASSWORD,
  SHIPROCKET_PICKUP_LOCATION,
} from "../../../config/shiprocket.js";
import { BadRequestError } from "../../../exceptions/ApiError.js";
import logger from "../../../logs/logger.js";

/**
 * SHIPROCKET ADAPTER
 * ------------------------------------------------------------------
 * Implements the common "provider" shape that logistics.service.js expects
 * from every courier integration:
 *   - checkServiceability({ pickupPincode, deliveryPincode, weightKg, codAmount })
 *       -> [{ courierName, rate, estimatedDeliveryDays, courierCompanyId }]
 *   - createShipment(shipmentInput) -> { shipmentId, awbCode, courierName, trackingUrl }
 *   - trackShipment(awbCode) -> { status, history }
 *   - cancelShipment(shipmentId) -> void
 *
 * Adding a second provider (NimbusPost, Delhivery, ...) later just means
 * writing another file with this same shape and registering it in
 * logistics.service.js's PROVIDERS map - nothing else in the app needs to
 * change.
 *
 * NOTE: This talks to the real Shiprocket API (https://apiv2.shiprocket.in).
 * It has NOT been exercised against a live Shiprocket account as part of
 * building this - that requires real SHIPROCKET_EMAIL/PASSWORD credentials
 * and a configured pickup location, neither of which are available in this
 * environment. The request/response shapes here follow Shiprocket's
 * published API docs as of this writing; verify against a live sandbox
 * account before relying on this in production, and watch for any API
 * changes Shiprocket makes over time.
 * ------------------------------------------------------------------
 */

// Auth tokens are valid for ~10 days per Shiprocket's docs - cache in memory
// rather than re-authenticating on every request.
let cachedToken = null;
let cachedTokenExpiresAt = null;

const getAuthToken = async () => {
  if (
    cachedToken &&
    cachedTokenExpiresAt &&
    cachedTokenExpiresAt > Date.now()
  ) {
    return cachedToken;
  }

  if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
    throw new BadRequestError(
      "Shiprocket credentials are not configured (SHIPROCKET_EMAIL/SHIPROCKET_PASSWORD)",
    );
  }

  const res = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.token) {
    logger.error("Shiprocket auth failed", { status: res.status, body: data });
    throw new BadRequestError("Could not authenticate with Shiprocket");
  }

  cachedToken = data.token;
  cachedTokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000; // refresh a day early, just in case
  return cachedToken;
};

const authedFetch = async (path, options = {}) => {
  const token = await getAuthToken();
  const res = await fetch(`${SHIPROCKET_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    logger.error("Shiprocket API error", {
      path,
      status: res.status,
      body: data,
    });
    throw new BadRequestError(data.message || "Shiprocket request failed");
  }
  return data;
};

// ---- Provider interface implementation ----

export const checkServiceability = async ({
  pickupPincode,
  deliveryPincode,
  weightKg,
  codAmount = 0,
}) => {
  const params = new URLSearchParams({
    pickup_postcode: pickupPincode,
    delivery_postcode: deliveryPincode,
    weight: String(weightKg),
    cod: codAmount > 0 ? "1" : "0",
  });

  const data = await authedFetch(
    `/courier/serviceability?${params.toString()}`,
  );

  const couriers = data?.data?.available_courier_companies || [];

  return couriers.map((courier) => ({
    provider: "shiprocket",
    courierCompanyId: courier.courier_company_id,
    courierName: courier.courier_name,
    rate: courier.rate,
    estimatedDeliveryDays: courier.estimated_delivery_days
      ? Number(courier.estimated_delivery_days)
      : null,
    codAvailable: Boolean(courier.cod),
  }));
};

// shipmentInput shape: { orderId, orderDate, pickupLocation, billing: {...}, shipping: {...},
//   items: [{ name, sku, units, sellingPrice }], paymentMethod: "COD"|"Prepaid",
//   subtotal, weightKg, courierCompanyId }
export const createShipment = async (shipmentInput) => {
  const orderPayload = {
    order_id: shipmentInput.orderId,
    order_date: shipmentInput.orderDate,
    pickup_location: SHIPROCKET_PICKUP_LOCATION,
    billing_customer_name: shipmentInput.billing.name,
    billing_address: shipmentInput.billing.address,
    billing_city: shipmentInput.billing.city,
    billing_pincode: shipmentInput.billing.pincode,
    billing_state: shipmentInput.billing.state,
    billing_country: "India",
    billing_email: shipmentInput.billing.email || "noreply@example.com",
    billing_phone: shipmentInput.billing.phone,
    shipping_is_billing: true,
    order_items: shipmentInput.items.map((item) => ({
      name: item.name,
      sku: item.sku,
      units: item.units,
      selling_price: item.sellingPrice,
    })),
    payment_method: shipmentInput.paymentMethod === "cod" ? "COD" : "Prepaid",
    sub_total: shipmentInput.subtotal,
    weight: shipmentInput.weightKg,
  };

  const createResult = await authedFetch("/orders/create/adhoc", {
    method: "POST",
    body: JSON.stringify(orderPayload),
  });

  const shipmentId = createResult.shipment_id;
  if (!shipmentId) {
    throw new BadRequestError("Shiprocket did not return a shipment id");
  }

  // Assigning an AWB (the actual trackable waybill number) is a separate
  // call - optionally pinning a specific courier if one was pre-selected
  // via checkServiceability, otherwise Shiprocket auto-assigns one.
  const awbPayload = {
    shipment_id: shipmentId,
    ...(shipmentInput.courierCompanyId
      ? { courier_id: shipmentInput.courierCompanyId }
      : {}),
  };

  const awbResult = await authedFetch("/courier/assign/awb", {
    method: "POST",
    body: JSON.stringify(awbPayload),
  });

  const awbData = awbResult?.response?.data;
  if (!awbData?.awb_code) {
    throw new BadRequestError("Shiprocket did not return an AWB code");
  }

  return {
    shipmentId: String(shipmentId),
    awbCode: awbData.awb_code,
    courierName: awbData.courier_name || null,
    trackingUrl: `https://shiprocket.co/tracking/${awbData.awb_code}`,
  };
};

export const trackShipment = async (awbCode) => {
  const data = await authedFetch(`/courier/track/awb/${awbCode}`);
  const trackData = data?.tracking_data;

  return {
    status: trackData?.shipment_status || null,
    history: (trackData?.shipment_track || []).map((entry) => ({
      status: entry.status,
      message: entry.activity || entry.status,
      occurredAt: entry.date ? new Date(entry.date) : new Date(),
    })),
  };
};

export const cancelShipment = async (shipmentId) => {
  await authedFetch("/orders/cancel", {
    method: "POST",
    body: JSON.stringify({ ids: [shipmentId] }),
  });
};
