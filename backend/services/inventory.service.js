import { BadRequestError } from "../exceptions/ApiError.js";

export const LOW_STOCK_THRESHOLD = 5;

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

// 👇 NEW - variant-aware. variantId=null means flat-stock product (unchanged behavior)
export const decrementStock = async (product, quantity, variantId = null) => {
  if (quantity <= 0) {
    throw new BadRequestError("Quantity must be greater than zero");
  }

  if (product.hasVariants) {
    const variant = product.getVariantById(variantId);
    if (!variant) {
      throw new BadRequestError("Selected variant no longer exists");
    }
    if (variant.stock < quantity) {
      throw new BadRequestError(
        `Insufficient stock for "${product.name}". Only ${variant.stock} left.`,
      );
    }
    variant.stock -= quantity;
  } else {
    if (product.stock < quantity) {
      throw new BadRequestError(
        `Insufficient stock for "${product.name}". Only ${product.stock} left.`,
      );
    }
    product.stock -= quantity;
  }

  await product.save();
  return product;
};

export const restoreStock = async (product, quantity, variantId = null) => {
  if (product.hasVariants) {
    const variant = product.getVariantById(variantId);
    if (variant) variant.stock += quantity;
  } else {
    product.stock += quantity;
  }

  await product.save();
  return product;
};

export const canFulfill = (product, requestedQuantity, variantId = null) => {
  if (!product.isActive) return false;

  if (product.hasVariants) {
    const variant = product.getVariantById(variantId);
    return !!variant && variant.stock >= requestedQuantity;
  }

  return product.stock >= requestedQuantity;
};
