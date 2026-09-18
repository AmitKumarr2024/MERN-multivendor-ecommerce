import Cart from "../modules/cart/models/cart.model.js";
import Product from "../modules/product/models/product.model.js";
import { BadRequestError, NotFoundError } from "../exceptions/ApiError.js";

/**
 * CART SERVICE
 * ------------------------------------------------------------------
 * Business rules for adding/updating/removing cart items. Controllers
 * just call these - all "can this actually be added" logic lives here.
 *
 * Variant-aware: a cart item is now uniquely identified by
 * (product, variantId) instead of just (product) - so Red/M and Red/L
 * of the same product are two separate line items.
 * ------------------------------------------------------------------
 */

export const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// Resolves how much stock is available, and the display name, for either
// a flat product or a specific variant - centralizes the branching so
// addItemToCart/updateItemQuantity don't duplicate this logic.
const resolveStockInfo = (product, variantId) => {
  if (!product.hasVariants) {
    return { availableStock: product.stock, label: product.name };
  }

  const variant = product.getVariantById(variantId);
  if (!variant) {
    throw new BadRequestError(
      "Please select a valid size/color option for this product",
    );
  }

  const variantLabel = [variant.color, variant.size]
    .filter(Boolean)
    .join(" / ");
  return {
    availableStock: variant.stock,
    label: `${product.name}${variantLabel ? ` (${variantLabel})` : ""}`,
  };
};

const findCartItem = (cart, productId, variantId) => {
  return cart.items.find(
    (item) =>
      item.product.toString() === productId &&
      String(item.variantId || "") === String(variantId || ""),
  );
};

export const addItemToCart = async (
  userId,
  productId,
  quantity = 1,
  variantId = null,
) => {
  if (quantity <= 0) {
    throw new BadRequestError("Quantity must be at least 1");
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new NotFoundError("Product not found or unavailable");
  }

  if (product.hasVariants && !variantId) {
    throw new BadRequestError(
      "Please select a size/color option before adding to cart",
    );
  }

  const { availableStock, label } = resolveStockInfo(product, variantId);

  const cart = await getOrCreateCart(userId);
  const existingItem = findCartItem(cart, productId, variantId);
  const requestedQuantity = existingItem
    ? existingItem.quantity + quantity
    : quantity;

  if (requestedQuantity > availableStock) {
    throw new BadRequestError(
      `Only ${availableStock} unit(s) of "${label}" available`,
    );
  }

  if (existingItem) {
    existingItem.quantity = requestedQuantity;
  } else {
    cart.items.push({ product: productId, variantId, quantity });
  }

  await cart.save();
  return cart;
};

export const updateItemQuantity = async (
  userId,
  productId,
  quantity,
  variantId = null,
) => {
  if (quantity <= 0) {
    throw new BadRequestError(
      "Quantity must be at least 1. Use remove to delete the item.",
    );
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  const { availableStock, label } = resolveStockInfo(product, variantId);
  if (quantity > availableStock) {
    throw new BadRequestError(
      `Only ${availableStock} unit(s) of "${label}" available`,
    );
  }

  const cart = await getOrCreateCart(userId);
  const item = findCartItem(cart, productId, variantId);
  if (!item) {
    throw new NotFoundError("Item not in cart");
  }

  item.quantity = quantity;
  await cart.save();
  return cart;
};

export const removeItemFromCart = async (
  userId,
  productId,
  variantId = null,
) => {
  const cart = await getOrCreateCart(userId);
  cart.items = cart.items.filter(
    (item) =>
      !(
        item.product.toString() === productId &&
        String(item.variantId || "") === String(variantId || "")
      ),
  );
  await cart.save();
  return cart;
};

export const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cart.save();
  return cart;
};
