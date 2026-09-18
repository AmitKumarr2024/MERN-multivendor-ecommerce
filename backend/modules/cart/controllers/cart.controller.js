import Cart from "../models/cart.model.js";
import { BadRequestError } from "../../../exceptions/ApiError.js";
import {
  getOrCreateCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  clearCart,
} from "../../../services/cart.service.js";
import { getEffectivePriceForVariant } from "../../../services/pricing.service.js";

const buildCartResponse = async (cart) => {
  const populatedCart = await cart.populate({
    path: "items.product",
    select:
      "name images price discountPrice stock isActive shop hasVariants variants",
    populate: { path: "shop", select: "shopName slug" },
  });

  const items = populatedCart.items.map((item) => {
    const unitPrice = getEffectivePriceForVariant(item.product, item.variantId);
    const variant = item.variantId
      ? item.product.getVariantById(item.variantId)
      : null;

    return {
      product: item.product,
      variantId: item.variantId,
      variant: variant
        ? {
            _id: variant._id,
            color: variant.color,
            size: variant.size,
            images: variant.images,
          }
        : null,
      quantity: item.quantity,
      unitPrice,
      subtotal: Number((unitPrice * item.quantity).toFixed(2)),
    };
  });

  const cartTotal = Number(
    items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2),
  );

  return { _id: populatedCart._id, items, cartTotal };
};

export const getMyCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    res.json(await buildCartResponse(cart));
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, variantId = null } = req.body;
    if (!productId) {
      throw new BadRequestError("productId is required");
    }

    const cart = await addItemToCart(
      req.user._id,
      productId,
      Number(quantity),
      variantId,
    );
    res.status(201).json(await buildCartResponse(cart));
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity, variantId = null } = req.body;
    if (quantity === undefined) {
      throw new BadRequestError("quantity is required");
    }

    const cart = await updateItemQuantity(
      req.user._id,
      req.params.productId,
      Number(quantity),
      variantId,
    );
    res.json(await buildCartResponse(cart));
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const variantId = req.query.variantId || req.body?.variantId || null;
    const cart = await removeItemFromCart(
      req.user._id,
      req.params.productId,
      variantId,
    );
    res.json(await buildCartResponse(cart));
  } catch (error) {
    next(error);
  }
};

export const emptyCart = async (req, res, next) => {
  try {
    const cart = await clearCart(req.user._id);
    res.json(await buildCartResponse(cart));
  } catch (error) {
    next(error);
  }
};
