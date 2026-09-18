import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import Shop from "../../shop/models/shop.model.js";
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "../../../exceptions/ApiError.js";
import { setStock } from "../../../services/inventory.service.js";

const assertOwnsProduct = async (userId, productId) => {
  const shop = await Shop.findOne({ owner: userId });
  const product = await Product.findById(productId);

  if (!product) {
    throw new NotFoundError("Product not found");
  }
  if (!shop || product.shop.toString() !== shop._id.toString()) {
    throw new ForbiddenError("You are not allowed to modify this product");
  }
  return product;
};

// @desc    Update product fields (only owner seller)
// @route   PUT /api/products/:id
// @access  Private (seller)
export const updateProduct = async (req, res, next) => {
  try {
    const product = await assertOwnsProduct(req.user._id, req.params.id);

    if (req.body.category) {
      const categoryExists = await Category.findOne({
        slug: req.body.category.toLowerCase(),
      });
      if (!categoryExists) {
        throw new BadRequestError("Invalid category");
      }
      req.body.category = categoryExists._id;
    }

    // Variants array poori tarah replace nahi karte "update" me - dedicated
    // endpoints (add/update/delete variant) use karo taaki accidental
    // full-array overwrite se stock data na uड़ jaaye. Yahan sirf non-variant
    // fields allow karte hain.
    const { variants, hasVariants, ...safeUpdates } = req.body;

    Object.assign(product, safeUpdates);
    await product.save();
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update stock only (flat-stock products, no variants)
// @route   PATCH /api/products/:id/stock
// @access  Private (seller)
export const updateProductStock = async (req, res, next) => {
  try {
    const product = await assertOwnsProduct(req.user._id, req.params.id);

    if (product.hasVariants) {
      throw new BadRequestError(
        "This product uses variants - update stock via /variants/:variantId instead",
      );
    }

    const { isLowStock, isOutOfStock } = await setStock(
      product,
      req.body.stock,
    );

    res.json({
      _id: product._id,
      stock: product.stock,
      isLowStock,
      isOutOfStock,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product active/inactive
// @route   PATCH /api/products/:id/toggle-active
// @access  Private (seller)
export const toggleProductActive = async (req, res, next) => {
  try {
    const product = await assertOwnsProduct(req.user._id, req.params.id);
    product.isActive = !product.isActive;
    await product.save();

    res.json({ _id: product._id, isActive: product.isActive });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// VARIANT MANAGEMENT - dedicated endpoints, dono garment (size/color)
// aur electronics (storage/color) jaise use-cases cover karte hain
// ============================================================

// @desc    Add a new variant (e.g. a new size/color combination)
// @route   POST /api/products/:id/variants
// @access  Private (seller)
export const addVariant = async (req, res, next) => {
  try {
    const product = await assertOwnsProduct(req.user._id, req.params.id);

    const { color, size, sku, price, discountPrice, stock, images } = req.body;
    if (stock === undefined) {
      throw new BadRequestError("Variant stock is required");
    }

    product.variants.push({
      color,
      size,
      sku,
      price,
      discountPrice,
      stock,
      images,
    });
    product.hasVariants = true; // pehla variant add hote hi mode switch ho jaata hai
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update one variant (stock, price, images etc.)
// @route   PUT /api/products/:id/variants/:variantId
// @access  Private (seller)
export const updateVariant = async (req, res, next) => {
  try {
    const product = await assertOwnsProduct(req.user._id, req.params.id);

    const variant = product.getVariantById(req.params.variantId);
    if (!variant) {
      throw new NotFoundError("Variant not found");
    }

    Object.assign(variant, req.body);
    await product.save();

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a variant
// @route   DELETE /api/products/:id/variants/:variantId
// @access  Private (seller)
export const deleteVariant = async (req, res, next) => {
  try {
    const product = await assertOwnsProduct(req.user._id, req.params.id);

    const variant = product.getVariantById(req.params.variantId);
    if (!variant) {
      throw new NotFoundError("Variant not found");
    }

    variant.deleteOne();

    // Agar sab variants delete ho gaye, flat-stock mode pe wapas switch karo
    if (product.variants.length === 0) {
      product.hasVariants = false;
    }

    await product.save();
    res.json(product);
  } catch (error) {
    next(error);
  }
};
