import Cart from "../../cart/models/cart.model.js";
import { getEffectivePriceForVariant } from "../../../services/pricing.service.js";
import * as offerService from "../../../services/offer/offer.service.js";
import { BadRequestError } from "../../../exceptions/ApiError.js";

// Builds { productId, categoryId, subtotal }[] for ONLY the cart lines that
// belong to this shop — mirrors how order.service.js's checkoutCart groups
// cart items by shop before pricing them.
async function buildShopCartItems(buyerId, shopId) {
  const cart = await Cart.findOne({ user: buyerId }).populate({
    path: "items.product",
    select: "shop price discountPrice hasVariants variants category",
  });
  if (!cart) return { items: [], itemsSubtotal: 0 };

  const items = [];
  for (const cartItem of cart.items) {
    const product = cartItem.product;
    if (!product || String(product.shop) !== String(shopId)) continue;
    const unitPrice = getEffectivePriceForVariant(product, cartItem.variantId);
    items.push({
      productId: product._id,
      categoryId: product.category,
      subtotal: Number((unitPrice * cartItem.quantity).toFixed(2)),
    });
  }
  const itemsSubtotal = Number(
    items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2),
  );
  return { items, itemsSubtotal };
}

// @desc    Preview a coupon against the buyer's current cart for one shop
// @route   POST /api/shops/:shopId/offers/validate-coupon  { code }
export const validateCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) throw new BadRequestError("A coupon code is required");

    const { items, itemsSubtotal } = await buildShopCartItems(
      req.user._id,
      req.params.shopId,
    );
    if (items.length === 0)
      throw new BadRequestError("Your cart has no items from this shop");

    const result = await offerService.validateCoupon({
      shopId: req.params.shopId,
      buyerId: req.user._id,
      code,
      items,
      itemsSubtotal,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
