import mongoose from "mongoose";
import Order from "../../order/models/order.model.js";
import Product from "../../product/models/product.model.js";
import { NotFoundError, BadRequestError } from "../../../exceptions/ApiError.js";
import { restoreStock } from "../../../services/inventory.service.js";

/**
 * ADMIN - ORDER MANAGEMENT
 * ------------------------------------------------------------------
 *   1. getAllOrdersAdmin -> GET    /api/admin/orders   (every order, any buyer/shop)
 *   2. forceDeleteOrder  -> DELETE /api/admin/orders/:id
 * ------------------------------------------------------------------
 * Deleting an order is intentionally admin-only and restricted - see
 * the rules inside forceDeleteOrder. Buyers/sellers should use
 * cancel (modules/order/controllers/order.update.controller.js)
 * instead, which preserves the record for audit/accounting purposes.
 */

// 1. Full visibility across every order in the system
export const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus, shop, buyer, page = 1, limit = 20 } = req.query;
    const query = {};

    if (orderStatus) query.orderStatus = orderStatus;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (shop) query.shop = shop;
    if (buyer) query.buyer = buyer;

    const safeLimit = Math.min(Number(limit) || 20, 100);

    const orders = await Order.find(query)
      .populate("shop", "shopName slug")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * safeLimit)
      .limit(safeLimit);

    const total = await Order.countDocuments(query);
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / safeLimit) });
  } catch (error) {
    next(error);
  }
};

// 2. Permanently delete an order record.
//    Rule: only allowed once the order is already cancelled OR delivered.
//    - cancelled  -> stock was already restored when it was cancelled, safe to erase
//    - delivered  -> completed sale, nothing to roll back, safe to erase (e.g. GDPR request)
//    - pending/confirmed/shipped -> BLOCKED. Force-deleting an in-flight order would
//      silently lose the buyer's paid order with no trace. Cancel it first.
export const forceDeleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    const deletableStatuses = ["cancelled", "delivered"];
    if (!deletableStatuses.includes(order.orderStatus)) {
      throw new BadRequestError(
        `Cannot delete an order that is still "${order.orderStatus}". Cancel it first, or wait until it's delivered.`
      );
    }

    // Extra safety: if somehow stock was never restored for a cancelled order
    // (e.g. data inconsistency from a manual DB edit), restore it now before erasing the record.
    if (order.orderStatus === "cancelled" && !order.stockRestored) {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          await restoreStock(product, item.quantity).catch(() => {
            // product may have been deleted separately - nothing to restore to, ignore
          });
        }
      }
    }

    await order.deleteOne();
    res.json({ message: "Order permanently deleted by admin" });
  } catch (error) {
    next(error);
  }
};