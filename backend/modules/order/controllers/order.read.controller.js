import Order from "../models/order.model.js";
import Shop from "../../shop/models/shop.model.js";
import { NotFoundError, ForbiddenError } from "../../../exceptions/ApiError.js";

/**
 * ORDER READ CONTROLLER
 * ------------------------------------------------------------------
 *   1. getMyOrders      -> GET /api/orders/me            (buyer's own order history)
 *   2. getOrderById      -> GET /api/orders/:id           (buyer or the owning seller only)
 *   3. getShopOrders     -> GET /api/orders/shop          (seller dashboard - orders for their shop)
 * ------------------------------------------------------------------
 */

// 1. Buyer's own order history
export const getMyOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { buyer: req.user._id };
    if (status) query.orderStatus = status;

    const safeLimit = Math.min(Number(limit) || 20, 100);

    const orders = await Order.find(query)
      .populate("shop", "shopName slug logo")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * safeLimit)
      .limit(safeLimit);

    const total = await Order.countDocuments(query);
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / safeLimit) });
  } catch (error) {
    next(error);
  }
};

// 2. Single order detail - only the buyer who placed it, or the seller who owns the shop, can view it
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("shop", "shopName slug logo owner");
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isShopOwner = order.shop.owner?.toString() === req.user._id.toString();

    if (!isBuyer && !isShopOwner && req.user.role !== "admin") {
      throw new ForbiddenError("You are not allowed to view this order");
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// 3. Seller dashboard - orders belonging to their shop
export const getShopOrders = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      throw new NotFoundError("You have not created a shop yet");
    }

    const { status, page = 1, limit = 20 } = req.query;
    const query = { shop: shop._id };
    if (status) query.orderStatus = status;

    const safeLimit = Math.min(Number(limit) || 20, 100);

    const orders = await Order.find(query)
      .populate("buyer", "name email phone")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * safeLimit)
      .limit(safeLimit);

    const total = await Order.countDocuments(query);
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / safeLimit) });
  } catch (error) {
    next(error);
  }
};