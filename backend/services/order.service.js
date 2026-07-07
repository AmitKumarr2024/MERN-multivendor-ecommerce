import mongoose from "mongoose";
import Order from "../modules/order/models/order.model.js";
import Cart from "../modules/cart/models/cart.model.js";
import { BadRequestError } from "../exceptions/ApiError.js";
import {
  getEffectivePrice,
  calculateLineItemTotal,
} from "./pricing.service.js";
import { decrementStock, restoreStock } from "./inventory.service.js";

/**
 * ORDER SERVICE
 * ------------------------------------------------------------------
 * The checkout algorithm lives here, not in the controller:
 *   1. Load the user's cart, populated with product + shop data.
 *   2. Group cart items by shop - a multi-vendor cart becomes one
 *      Order document per shop (mirrors how Amazon/Flipkart split
 *      a single checkout into separate seller shipments).
 *   3. For each shop's items: validate stock, decrement it, calculate
 *      totals via pricing.service, and create the Order.
 *   4. If anything fails partway through, roll back stock already
 *      decremented for the orders that did succeed.
 *   5. Clear the cart once all orders are created successfully.
 *
 * NOTE: True atomicity here would use a MongoDB replica-set transaction
 * (mongoose session). This uses a manual best-effort rollback instead,
 * which is fine for a single-instance MongoDB setup. Upgrade to
 * `mongoose.startSession()` transactions once running a replica set.
 * ------------------------------------------------------------------
 */

const groupItemsByShop = (cartItems) => {
  const groups = new Map();

  for (const item of cartItems) {
    const product = item.product;
    if (!product || !product.isActive) {
      throw new BadRequestError(
        `A product in your cart is no longer available`,
      );
    }

    const shopId = product.shop._id.toString();
    if (!groups.has(shopId)) {
      groups.set(shopId, { shop: product.shop, items: [] });
    }
    groups.get(shopId).items.push(item);
  }

  return groups;
};

export const checkoutCart = async (
  userId,
  { shippingAddress, paymentMethod = "cod" } = {},
) => {
  if (
    !shippingAddress ||
    !shippingAddress.street ||
    !shippingAddress.city ||
    !shippingAddress.phone
  ) {
    throw new BadRequestError(
      "A complete shipping address (phone, street, city) is required",
    );
  }

  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    select: "name images price discountPrice stock isActive shop",
    populate: { path: "shop", select: "_id shopName" },
  });

  if (!cart || cart.items.length === 0) {
    throw new BadRequestError("Your cart is empty");
  }

  const shopGroups = groupItemsByShop(cart.items);
  const createdOrders = [];
  const decrementedForRollback = []; // { product, quantity } - in case we need to undo

  try {
    for (const [, group] of shopGroups) {
      const orderItems = [];
      let itemsSubtotal = 0;
      let tax = 0;

      for (const cartItem of group.items) {
        const product = cartItem.product;

        // decrementStock throws if not enough stock - caught below for rollback
        await decrementStock(product, cartItem.quantity);
        decrementedForRollback.push({ product, quantity: cartItem.quantity });

        const lineTotal = calculateLineItemTotal(product, cartItem.quantity);
        itemsSubtotal += lineTotal.subtotal;
        tax += lineTotal.tax;

        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.images?.[0] || "",
          unitPrice: getEffectivePrice(product),
          quantity: cartItem.quantity,
          subtotal: lineTotal.subtotal,
        });
      }

      const shippingCost = 0; // flat/free for now - shipment module will calculate this via courier rates later
      const grandTotal = Number(
        (itemsSubtotal + tax + shippingCost).toFixed(2),
      );

      const order = await Order.create({
        buyer: userId,
        shop: group.shop._id,
        items: orderItems,
        itemsSubtotal: Number(itemsSubtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        shippingCost,
        grandTotal,
        shippingAddress,
        paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pending" : "pending", // gateway will update this once wired in
      });

      createdOrders.push(order);
    }

    // Everything succeeded - empty the cart
    cart.items = [];
    await cart.save();

    return createdOrders;
  } catch (error) {
    // Best-effort rollback: restore stock for everything we'd already decremented
    for (const { product, quantity } of decrementedForRollback) {
      await restoreStock(product, quantity).catch(() => {
        // if rollback itself fails, there's nothing more we can safely do here;
        // this is exactly the scenario a real DB transaction would prevent
      });
    }
    // Also remove any orders that got created before the failure
    await Order.deleteMany({ _id: { $in: createdOrders.map((o) => o._id) } });

    throw error;
  }
};

export const cancelOrder = async (order, reason) => {
  if (["shipped", "delivered", "cancelled"].includes(order.orderStatus)) {
    throw new BadRequestError(
      `Order cannot be cancelled once it is ${order.orderStatus}`,
    );
  }

  // Restore stock for each item back to the product
  const Product = mongoose.model("Product");
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      await restoreStock(product, item.quantity);
    }
  }

  order.orderStatus = "cancelled";
  order.cancelReason = reason || "Cancelled by user";
  order.stockRestored = true;
  await order.save();

  return order;
};
