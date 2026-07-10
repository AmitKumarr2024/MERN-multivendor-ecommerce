import { checkoutCart } from "../../../services/order.service.js";
import Shop from "../../shop/models/shop.model.js";
import { emitNewOrderToSeller } from "../../../sockets/emit.js";

// @desc    Place an order from the current cart (splits into one order per shop)
// @route   POST /api/orders/checkout
// @access  Private (buyer)
export const checkout = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    const orders = await checkoutCart(req.user._id, {
      shippingAddress,
      paymentMethod,
    });

    // Notify each affected seller in real time - "You have a new order!"
    for (const order of orders) {
      const shop = await Shop.findById(order.shop).select("owner shopName");
      if (shop) {
        emitNewOrderToSeller(shop.owner, {
          orderId: order._id,
          grandTotal: order.grandTotal,
          itemCount: order.items.length,
        });
      }
    }

    res.status(201).json({
      message: `${orders.length} order(s) placed successfully`,
      orders,
    });
  } catch (error) {
    next(error);
  }
};
