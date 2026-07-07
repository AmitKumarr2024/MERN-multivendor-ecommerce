import { BadRequestError } from "../exceptions/ApiError.js";

/**
 * INVENTORY SERVICE
 * ------------------------------------------------------------------
 * Business rules around stock levels. Controller just calls these
 * functions and doesn't need to know the rules itself.
 * ------------------------------------------------------------------
 */

export const LOW_STOCK_THRESHOLD = 5;

/**
 * Sets a product's stock to an exact value, with validation.
 * Returns { product, isLowStock } so the controller/caller can decide
 * whether to trigger a notification.
 */
export const setStock = async (product, newStock) => {
  if (typeof newStock !== "number" || newStock < 0) {
    throw new BadRequestError("Stock must be a non-negative number");
  }

  product.stock = newStock;
  await product.save();

  return {
    product,
    isLowStock: newStock > 0 && newStock <= LOW_STOCK_THRESHOLD,
    isOutOfStock: newStock === 0,
  };
};

/**
 * Decrements stock when an order is placed. Throws if not enough stock.
 * This is the function the future Order service will call.
 */
export const decrementStock = async (product, quantity) => {
  if (quantity <= 0) {
    throw new BadRequestError("Quantity must be greater than zero");
  }
  if (product.stock < quantity) {
    throw new BadRequestError(
      `Insufficient stock for "${product.name}". Only ${product.stock} left.`,
    );
  }

  product.stock -= quantity;
  await product.save();

  return product;
};

/**
 * Restores stock, e.g. when an order is cancelled or returned.
 */
export const restoreStock = async (product, quantity) => {
  product.stock += quantity;
  await product.save();
  return product;
};

/**
 * Checks if a product can fulfill a requested quantity, without mutating anything.
 * Useful for cart validation before checkout.
 */
export const canFulfill = (product, requestedQuantity) => {
  return product.isActive && product.stock >= requestedQuantity;
};
