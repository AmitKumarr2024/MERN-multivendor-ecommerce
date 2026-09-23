import mongoose from "mongoose";
import Order from "../modules/order/models/order.model.js";
import Cart from "../modules/cart/models/cart.model.js";
import { BadRequestError } from "../exceptions/ApiError.js";
import {
  getEffectivePriceForVariant,
  calculateLineItemTotal,
} from "./pricing.service.js";
import { decrementStock, restoreStock } from "./inventory.service.js";
import {
  canUseKhata,
  chargeKhataForOrder,
  reverseKhataCharge,
} from "./khata/khata.service.js";
import {
  validateCoupon,
  redeemOffer,
  reverseOfferRedemption,
} from "./offer/offer.service.js";

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
    if (!groups.has(shopId))
      groups.set(shopId, { shop: product.shop, items: [] });
    groups.get(shopId).items.push(item);
  }
  return groups;
};

export const checkoutCart = async (
  userId,
  { shippingAddress, paymentMethod = "cod", couponCode } = {},
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
    select:
      "name images price discountPrice stock isActive shop hasVariants variants category",
    populate: { path: "shop", select: "_id shopName" },
  });

  if (!cart || cart.items.length === 0)
    throw new BadRequestError("Your cart is empty");

  const shopGroups = groupItemsByShop(cart.items);

  if (paymentMethod === "khata" && shopGroups.size > 1) {
    throw new BadRequestError(
      "Khata payment is only available when all items in your cart are from the same shop",
    );
  }
  // Coupons are shop-specific ledgers, same reasoning as Khata — a code
  // can't be split proportionally across a multi-vendor cart.
  if (couponCode && shopGroups.size > 1) {
    throw new BadRequestError(
      "Coupon codes can only be applied when all items in your cart are from the same shop",
    );
  }

  const createdOrders = [];
  const decrementedForRollback = [];
  const khataChargedForRollback = [];
  let redeemedOfferOrderId = null;

  try {
    for (const [shopId, group] of shopGroups) {
      const orderItems = [];
      const couponItems = []; // { productId, categoryId, subtotal } for offer eligibility
      let itemsSubtotal = 0;
      let tax = 0;

      for (const cartItem of group.items) {
        const product = cartItem.product;
        const variantId = cartItem.variantId || null;
        const variant = variantId ? product.getVariantById(variantId) : null;

        if (product.hasVariants && !variant) {
          throw new BadRequestError(
            `A selected option for "${product.name}" is no longer available`,
          );
        }

        await decrementStock(product, cartItem.quantity, variantId);
        decrementedForRollback.push({
          product,
          quantity: cartItem.quantity,
          variantId,
        });

        const unitPrice = getEffectivePriceForVariant(product, variantId);
        const lineTotal = calculateLineItemTotal(
          { ...product.toObject(), price: unitPrice, discountPrice: null },
          cartItem.quantity,
        );
        itemsSubtotal += lineTotal.subtotal;
        tax += lineTotal.tax;

        orderItems.push({
          product: product._id,
          variantId,
          color: variant?.color || null,
          size: variant?.size || null,
          name: product.name,
          image: variant?.images?.[0] || product.images?.[0] || "",
          unitPrice,
          quantity: cartItem.quantity,
          subtotal: lineTotal.subtotal,
        });
        couponItems.push({
          productId: product._id,
          categoryId: product.category,
          subtotal: lineTotal.subtotal,
        });
      }

      const shippingCost = 0;

      // Coupon validation is re-run here — the LAST gate before the order
      // is created — never trusted from whatever the frontend previewed.
      let couponResult = null;
      if (couponCode) {
        couponResult = await validateCoupon({
          shopId,
          buyerId: userId,
          code: couponCode,
          items: couponItems,
          itemsSubtotal: Number(itemsSubtotal.toFixed(2)),
        });
        if (!couponResult.eligible) {
          throw new BadRequestError(
            "This coupon can no longer be applied to your order (" +
              (couponResult.reason || "not eligible") +
              ")",
          );
        }
      }

      const discount = couponResult ? couponResult.discountAmount : 0;
      const grandTotal = Number(
        Math.max(itemsSubtotal + tax + shippingCost - discount, 0).toFixed(2),
      );

      if (paymentMethod === "khata") {
        const eligibility = await canUseKhata(shopId, userId, grandTotal);
        if (!eligibility.eligible) {
          throw new BadRequestError(
            eligibility.reason === "insufficient_credit"
              ? "Insufficient Khata credit for this order — choose another payment method"
              : "Khata is not available for this shop or your request is not yet approved",
          );
        }
      }

      const order = await Order.create({
        buyer: userId,
        shop: group.shop._id,
        items: orderItems,
        itemsSubtotal: Number(itemsSubtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        shippingCost,
        discount,
        couponCode: couponResult ? couponResult.offer.code : null,
        offer: couponResult ? couponResult.offer._id : null,
        grandTotal,
        shippingAddress,
        paymentMethod,
        paymentStatus: paymentMethod === "khata" ? "khata_pending" : "pending",
      });

      createdOrders.push(order);

      if (couponResult) {
        await redeemOffer({
          offer: couponResult.offer,
          buyerId: userId,
          orderId: order._id,
          discountAmount: discount,
        });
        redeemedOfferOrderId = order._id;
      }

      if (paymentMethod === "khata") {
        await chargeKhataForOrder({
          shopId: group.shop._id,
          buyerId: userId,
          orderId: order._id,
          amount: grandTotal,
        });
        khataChargedForRollback.push({
          shopId: group.shop._id,
          buyerId: userId,
          orderId: order._id,
        });
      }
    }

    cart.items = [];
    await cart.save();

    return createdOrders;
  } catch (error) {
    for (const { product, quantity, variantId } of decrementedForRollback) {
      await restoreStock(product, quantity, variantId).catch(() => {});
    }
    for (const { shopId, buyerId, orderId } of khataChargedForRollback) {
      await reverseKhataCharge({ shopId, buyerId, orderId }).catch(() => {});
    }
    if (redeemedOfferOrderId) {
      await reverseOfferRedemption(redeemedOfferOrderId).catch(() => {});
    }
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

  const Product = mongoose.model("Product");
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product)
      await restoreStock(product, item.quantity, item.variantId || null);
  }

  if (
    order.paymentMethod === "khata" &&
    order.paymentStatus === "khata_pending"
  ) {
    await reverseKhataCharge({
      shopId: order.shop,
      buyerId: order.buyer,
      orderId: order._id,
    }).catch(() => {});
  }
  if (order.offer) {
    await reverseOfferRedemption(order._id).catch(() => {});
  }

  order.orderStatus = "cancelled";
  order.cancelReason = reason || "Cancelled by user";
  order.stockRestored = true;
  await order.save();

  return order;
};
