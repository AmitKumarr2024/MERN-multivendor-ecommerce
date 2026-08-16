import { checkoutCart } from "../../../services/order.service.js";
import Shop from "../../shop/models/shop.model.js";
import { emitNewOrderToSeller } from "../../../sockets/emit.js";
import { createNotification } from "../../../services/notification.service.js";

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

    // checkoutCart se orders ban jaane ke baad, har order ke liye:
    for (const order of orders) {
      const shop = await Shop.findById(order.shop);
      await createNotification({
        recipient: shop.owner,
        type: "order_placed",
        title: "New order received",
        message: `You received a new order worth ₹${order.grandTotal}`,
        link: `/seller/orders`,
        relatedId: order._id,
        relatedModel: "Order",
      });
    }

    res.status(201).json({
      message: `${orders.length} order(s) placed successfully`,
      orders,
    });
  } catch (error) {
    next(error);
  }
};
