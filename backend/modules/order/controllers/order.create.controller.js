import { checkoutCart } from "../../../services/order.service.js";

// @desc    Place an order from the current cart (splits into one order per shop)
// @route   POST /api/orders/checkout
// @access  Private (buyer)
export const checkout = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const orders = await checkoutCart(req.user._id, { shippingAddress, paymentMethod });

    res.status(201).json({
      message: `${orders.length} order(s) placed successfully`,
      orders,
    });
  } catch (error) {
    next(error);
  }
};