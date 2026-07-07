import Cart from "../models/cart.model.js";
import { BadRequestError } from "../../../exceptions/ApiError.js";
import {
  getOrCreateCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  clearCart,
} from "../../../services/cart.service.js";
import { getEffectivePrice } from "../../../services/pricing.service.js";

/**
 * CART CONTROLLER
 * ------------------------------------------------------------------
 * New developer? This is the full list of what's available here:
 *
 *   1. getMyCart       -> GET    /api/cart
 *   2. addToCart       -> POST   /api/cart/items
 *   3. updateCartItem  -> PUT    /api/cart/items/:productId
 *   4. removeCartItem  -> DELETE /api/cart/items/:productId
 *   5. emptyCart       -> DELETE /api/cart
 *
 * All the "is this allowed" rules (stock checks, quantity validation)
 * live in services/cart.service.js - this file only handles HTTP.
 * ------------------------------------------------------------------
 */

// Populates cart items with product data and attaches computed price/subtotal per item + cart total
const buildCartResponse = async (cart) => {
  const populatedCart = await cart.populate({
    path: "items.product",
    select: "name images price discountPrice stock isActive shop",
    populate: { path: "shop", select: "shopName slug" },
  });

  const items = populatedCart.items.map((item) => {
    const unitPrice = getEffectivePrice(item.product);
    return {
      product: item.product,
      quantity: item.quantity,
      unitPrice,
      subtotal: Number((unitPrice * item.quantity).toFixed(2)),
    };
  });

  const cartTotal = Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));

  return { _id: populatedCart._id, items, cartTotal };
};

// 1. ----------------------------------------------------------------
// @desc    Get logged-in user's cart with computed prices
// @route   GET /api/cart
// @access  Private
export const getMyCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    res.json(await buildCartResponse(cart));
  } catch (error) {
    next(error);
  }
};

// 2. ----------------------------------------------------------------
// @desc    Add a product to cart (or increase quantity if already present)
// @route   POST /api/cart/items
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      throw new BadRequestError("productId is required");
    }

    const cart = await addItemToCart(req.user._id, productId, Number(quantity));
    res.status(201).json(await buildCartResponse(cart));
  } catch (error) {
    next(error);
  }
};

// 3. ----------------------------------------------------------------
// @desc    Set a cart item's quantity to an exact value
// @route   PUT /api/cart/items/:productId
// @access  Private
export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined) {
      throw new BadRequestError("quantity is required");
    }

    const cart = await updateItemQuantity(req.user._id, req.params.productId, Number(quantity));
    res.json(await buildCartResponse(cart));
  } catch (error) {
    next(error);
  }
};

// 4. ----------------------------------------------------------------
// @desc    Remove one product from the cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
export const removeCartItem = async (req, res, next) => {
  try {
    const cart = await removeItemFromCart(req.user._id, req.params.productId);
    res.json(await buildCartResponse(cart));
  } catch (error) {
    next(error);
  }
};

// 5. ----------------------------------------------------------------
// @desc    Empty the entire cart
// @route   DELETE /api/cart
// @access  Private
export const emptyCart = async (req, res, next) => {
  try {
    const cart = await clearCart(req.user._id);
    res.json(await buildCartResponse(cart));
  } catch (error) {
    next(error);
  }
};