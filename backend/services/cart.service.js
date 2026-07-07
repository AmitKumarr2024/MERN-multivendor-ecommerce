import Cart from "../modules/cart/models/cart.model.js";
import Product from "../modules/product/models/product.model.js";
import { BadRequestError, NotFoundError } from "../exceptions/ApiError.js";
import { canFulfill } from "./inventory.service.js";

/**
 * CART SERVICE
 * ------------------------------------------------------------------
 * Business rules for adding/updating/removing cart items. Controllers
 * just call these - all "can this actually be added" logic lives here.
 * ------------------------------------------------------------------
 */

// Fetches (or lazily creates) a user's cart
export const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// Adds a product to the cart, or increases quantity if it's already in there.
// Validates stock availability before allowing it.
export const addItemToCart = async (userId, productId, quantity = 1) => {
  if (quantity <= 0) {
    throw new BadRequestError("Quantity must be at least 1");
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new NotFoundError("Product not found or unavailable");
  }

  const cart = await getOrCreateCart(userId);
  const existingItem = cart.items.find((item) => item.product.toString() === productId);
  const requestedQuantity = existingItem ? existingItem.quantity + quantity : quantity;

  if (!canFulfill(product, requestedQuantity)) {
    throw new BadRequestError(`Only ${product.stock} unit(s) of "${product.name}" available`);
  }

  if (existingItem) {
    existingItem.quantity = requestedQuantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  return cart;
};

// Sets an item's quantity to an exact value (used by a quantity input in the UI)
export const updateItemQuantity = async (userId, productId, quantity) => {
  if (quantity <= 0) {
    throw new BadRequestError("Quantity must be at least 1. Use remove to delete the item.");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundError("Product not found");
  }
  if (!canFulfill(product, quantity)) {
    throw new BadRequestError(`Only ${product.stock} unit(s) of "${product.name}" available`);
  }

  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) {
    throw new NotFoundError("Item not in cart");
  }

  item.quantity = quantity;
  await cart.save();
  return cart;
};

// Removes one product entirely from the cart
export const removeItemFromCart = async (userId, productId) => {
  const cart = await getOrCreateCart(userId);
  cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  await cart.save();
  return cart;
};

// Empties the cart entirely (called after successful checkout, or manually by user)
export const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cart.save();
  return cart;
};