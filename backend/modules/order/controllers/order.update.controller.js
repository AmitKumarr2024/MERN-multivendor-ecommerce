import Order from "../models/order.model.js";
import Shop from "../../shop/models/shop.model.js";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../../exceptions/ApiError.js";
import { cancelOrder as cancelOrderService } from "../../../services/order.service.js";

const VALID_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

// @desc    Seller updates order status (confirm, ship, deliver)
// @route   PATCH /api/orders/:id/status
// @access  Private (seller - only for their own shop's orders)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      throw new BadRequestError(`Status must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop || order.shop.toString() !== shop._id.toString()) {
      throw new ForbiddenError("You are not allowed to update this order");
    }

    order.orderStatus = status;
    await order.save();

    res.json({ _id: order._id, orderStatus: order.orderStatus });
  } catch (error) {
    next(error);
  }
};

// @desc    Buyer cancels their own order (only while it's still pending/confirmed) - restores stock
// @route   PATCH /api/orders/:id/cancel
// @access  Private (buyer - only their own order)
export const cancelMyOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    if (order.buyer.toString() !== req.user._id.toString()) {
      throw new ForbiddenError("You are not allowed to cancel this order");
    }

    const updatedOrder = await cancelOrderService(order, req.body.reason);
    res.json({ _id: updatedOrder._id, orderStatus: updatedOrder.orderStatus });
  } catch (error) {
    next(error);
  }
};