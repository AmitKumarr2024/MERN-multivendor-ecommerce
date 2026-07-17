import * as shiprocket from "../logistics/providers/shiprocketAdapter.js";
import Order from "../../modules/order/models/order.model.js";
import Product from "../../modules/product/models/product.model.js";
import Shop from "../../modules/shop/models/shop.model.js";
import { BadRequestError, NotFoundError } from "../../exceptions/ApiError.js";
import { emitOrderStatusUpdate } from "../../sockets/emit.js";

/**
 * LOGISTICS SERVICE
 * ------------------------------------------------------------------
 * This is the abstraction layer the product vision calls for: sellers never
 * see courier names, API keys, or rate comparisons. They just mark an order
 * "ready to ship" and this module picks the best available courier across
 * every configured provider automatically.
 *
 * To add a new provider later: write an adapter file with the same 4
 * functions as shiprocketAdapter.js (checkServiceability, createShipment,
 * trackShipment, cancelShipment), then add it to the PROVIDERS map below -
 * nothing else in the app changes.
 * ------------------------------------------------------------------
 */

const PROVIDERS = {
  shiprocket,
  // nimbuspost: nimbusPostAdapter,   // TODO once that adapter exists
  // delhivery: delhiveryAdapter,     // TODO once that adapter exists
};

// ---- Serviceability + rate aggregation across all configured providers ----

// Calls checkServiceability on every registered provider in parallel, merges
// the results into one flat list, and sorts cheapest-first. A provider that
// errors (e.g. not serviceable there, or temporarily down) is skipped rather
// than failing the whole request - as long as at least one provider has an
// option, checkout should still work.
export const getAvailableCourierOptions = async ({
  pickupPincode,
  deliveryPincode,
  weightKg,
  codAmount = 0,
}) => {
  const providerNames = Object.keys(PROVIDERS);

  const results = await Promise.allSettled(
    providerNames.map((name) =>
      PROVIDERS[name].checkServiceability({
        pickupPincode,
        deliveryPincode,
        weightKg,
        codAmount,
      }),
    ),
  );

  const allOptions = [];
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      allOptions.push(...result.value);
    }
    // silently skip rejected providers - logged inside each adapter already
  });

  return allOptions.sort((a, b) => a.rate - b.rate);
};

// The actual "platform decides, seller doesn't" rule. Default strategy is
// cheapest - swap to "fastest" (sort by estimatedDeliveryDays) if the
// business wants to prioritize speed over cost instead.
//
// Sorts internally rather than trusting the caller to have pre-sorted -
// getAvailableCourierOptions() happens to already sort cheapest-first, but
// this function must give the correct answer regardless of input order.
export const selectBestCourier = (options, strategy = "cheapest") => {
  if (!options || options.length === 0) {
    throw new BadRequestError(
      "No courier is currently serviceable for this route",
    );
  }

  if (strategy === "fastest") {
    return [...options].sort(
      (a, b) =>
        (a.estimatedDeliveryDays ?? 99) - (b.estimatedDeliveryDays ?? 99),
    )[0];
  }
  return [...options].sort((a, b) => a.rate - b.rate)[0];
};

// ---- Shipment creation - the seller-facing "just ship it" action ----

// Computes total shipment weight from the order's line items by looking up
// each product's weightKg (orders don't snapshot weight at checkout time,
// only price/name - weight can be looked up fresh since it rarely changes).
const calculateOrderWeight = async (order) => {
  const productIds = order.items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } }).select(
    "weightKg",
  );
  const weightById = new Map(
    products.map((p) => [p._id.toString(), p.weightKg || 0.5]),
  );

  return order.items.reduce((total, item) => {
    const unitWeight = weightById.get(item.product.toString()) || 0.5;
    return total + unitWeight * item.quantity;
  }, 0);
};

// This is what a seller triggers by clicking "Ship this order" - everything
// from here down is automatic.
export const autoCreateShipmentForOrder = async (order) => {
  if (order.shipment?.awbCode) {
    throw new BadRequestError("This order already has a shipment created");
  }

  const shop = await Shop.findById(order.shop);
  if (!shop || !shop.address?.pincode) {
    throw new BadRequestError(
      "Shop pickup address (with pincode) is required before shipping orders",
    );
  }
  if (!order.shippingAddress?.pincode) {
    throw new BadRequestError("Order is missing a delivery pincode");
  }

  const weightKg = await calculateOrderWeight(order);

  const options = await getAvailableCourierOptions({
    pickupPincode: shop.address.pincode,
    deliveryPincode: order.shippingAddress.pincode,
    weightKg,
    codAmount: order.paymentMethod === "cod" ? order.grandTotal : 0,
  });

  const chosen = selectBestCourier(options, "cheapest");

  const provider = PROVIDERS[chosen.provider];
  const result = await provider.createShipment({
    orderId: order._id.toString(),
    orderDate: order.createdAt.toISOString().slice(0, 10),
    billing: {
      name: order.shippingAddress.fullName || "Customer",
      address: order.shippingAddress.street,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      pincode: order.shippingAddress.pincode,
      phone: order.shippingAddress.phone,
    },
    items: order.items.map((item) => ({
      name: item.name,
      sku: item.product.toString(),
      units: item.quantity,
      sellingPrice: item.unitPrice,
    })),
    paymentMethod: order.paymentMethod,
    subtotal: order.itemsSubtotal,
    weightKg,
    courierCompanyId: chosen.courierCompanyId,
  });

  order.shipment = {
    provider: chosen.provider,
    courierName: result.courierName || chosen.courierName,
    shipmentId: result.shipmentId,
    awbCode: result.awbCode,
    trackingId: result.awbCode,
    rate: chosen.rate,
    estimatedDeliveryDays: chosen.estimatedDeliveryDays,
    status: "pickup_scheduled",
    trackingUrl: result.trackingUrl,
    lastWebhookAt: null,
    history: [
      {
        status: "pickup_scheduled",
        message: "Shipment created",
        occurredAt: new Date(),
      },
    ],
  };
  order.orderStatus = "confirmed";
  await order.save();

  emitOrderStatusUpdate(order.buyer, {
    orderId: order._id,
    orderStatus: order.orderStatus,
    shipmentStatus: order.shipment.status,
    trackingUrl: order.shipment.trackingUrl,
  });

  return order;
};

// ---- Webhook handling - couriers push status updates here as the package moves ----

// Maps each provider's own status vocabulary onto our internal orderStatus
// enum, so the rest of the app doesn't need to know provider-specific terms.
const SHIPMENT_STATUS_TO_ORDER_STATUS = {
  pickup_scheduled: "confirmed",
  in_transit: "shipped",
  out_for_delivery: "shipped",
  delivered: "delivered",
  returned: "cancelled",
};

export const handleShipmentWebhook = async (providerName, payload) => {
  // Shiprocket's webhook payload includes the awb code and a status string -
  // exact field names per their webhook docs.
  const awbCode = payload.awb || payload.awb_code;
  const status = payload.current_status || payload.status;

  if (!awbCode || !status) {
    throw new BadRequestError("Webhook payload is missing awb/status");
  }

  const order = await Order.findOne({ "shipment.awbCode": awbCode });
  if (!order) {
    throw new NotFoundError("No order found for this AWB code");
  }

  const normalizedStatus = status.toLowerCase().replace(/\s+/g, "_");

  order.shipment.status = normalizedStatus;
  order.shipment.lastWebhookAt = new Date();
  order.shipment.history.push({
    status: normalizedStatus,
    message: payload.activity || status,
    occurredAt: new Date(),
  });

  const mappedOrderStatus = SHIPMENT_STATUS_TO_ORDER_STATUS[normalizedStatus];
  if (mappedOrderStatus) {
    order.orderStatus = mappedOrderStatus;
  }

  await order.save();

  emitOrderStatusUpdate(order.buyer, {
    orderId: order._id,
    orderStatus: order.orderStatus,
    shipmentStatus: order.shipment.status,
  });

  return order;
};

export const trackOrderShipment = async (order) => {
  if (!order.shipment?.awbCode || !order.shipment?.provider) {
    throw new BadRequestError("This order does not have a shipment yet");
  }

  const provider = PROVIDERS[order.shipment.provider];
  return provider.trackShipment(order.shipment.awbCode);
};
