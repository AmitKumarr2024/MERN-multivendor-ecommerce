import Order from "../../order/models/order.model.js";
import Shop from "../../shop/models/shop.model.js";
import {
  getAvailableCourierOptions,
  autoCreateShipmentForOrder,
  handleShipmentWebhook,
  trackOrderShipment,
} from "../../../services/logistics/logistics.service.js";
import { BadRequestError, NotFoundError, ForbiddenError } from "../../../exceptions/ApiError.js";

/**
 * LOGISTICS CONTROLLER
 * ------------------------------------------------------------------
 *   1. checkServiceability -> POST /api/logistics/check              (public - checkout page delivery estimate)
 *   2. shipOrder             -> POST /api/orders/:id/ship              (seller - "just ship it" button)
 *   3. getTracking            -> GET  /api/orders/:id/tracking          (buyer/seller/admin)
 *   4. shiprocketWebhook      -> POST /api/logistics/webhook/shiprocket (public - called by Shiprocket, not a browser)
 * ------------------------------------------------------------------
 */

// 1. Public - lets the checkout page show "Delivery in ~4 days, ₹49" before the
// order even exists, without exposing which courier company will actually be used.
export const checkServiceability = async (req, res, next) => {
  try {
    const { shopId, deliveryPincode, weightKg } = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop || !shop.address?.pincode) {
      throw new BadRequestError("This shop has not configured a pickup pincode yet");
    }

    const options = await getAvailableCourierOptions({
      pickupPincode: shop.address.pincode,
      deliveryPincode,
      weightKg: weightKg || 0.5,
    });

    if (options.length === 0) {
      return res.json({ serviceable: false });
    }

    const cheapest = options[0];
    res.json({
      serviceable: true,
      estimatedRate: cheapest.rate,
      estimatedDeliveryDays: cheapest.estimatedDeliveryDays,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Seller-triggered - this is the entire "shipping" experience a seller gets.
// No courier picker, no rate comparison - just a button that says "Ship".
export const shipOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new NotFoundError("Order not found");

    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop || order.shop.toString() !== shop._id.toString()) {
      throw new ForbiddenError("You are not allowed to ship this order");
    }

    const updatedOrder = await autoCreateShipmentForOrder(order);

    res.json({
      message: "Shipment created successfully",
      shipment: updatedOrder.shipment,
    });
  } catch (error) {
    next(error);
  }
};

// 3. Buyer, the owning seller, or an admin can check tracking status
export const getTracking = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("shop", "owner");
    if (!order) throw new NotFoundError("Order not found");

    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isShopOwner = order.shop.owner?.toString() === req.user._id.toString();
    if (!isBuyer && !isShopOwner && req.user.role !== "admin") {
      throw new ForbiddenError("You are not allowed to view this order's tracking");
    }

    if (!order.shipment?.awbCode) {
      return res.json({ shipment: order.shipment, liveTracking: null });
    }

    const liveTracking = await trackOrderShipment(order);
    res.json({ shipment: order.shipment, liveTracking });
  } catch (error) {
    next(error);
  }
};

// 4. Public webhook endpoint - Shiprocket posts here directly, no user session
// involved. Authenticity is normally verified via a shared secret/signature
// header - see the TODO in the route file for wiring that up once Shiprocket
// account settings provide one.
export const shiprocketWebhook = async (req, res, next) => {
  try {
    await handleShipmentWebhook("shiprocket", req.body);
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};