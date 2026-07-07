import Product from "../../product/models/product.model.js";
import { NotFoundError } from "../../../exceptions/ApiError.js";

/**
 * ADMIN - PRODUCT MANAGEMENT
 * ------------------------------------------------------------------
 *   1. getAllProductsAdmin -> GET   /api/admin/products
 *   2. forceToggleProduct  -> PATCH /api/admin/products/:id/toggle-active
 *   3. forceDeleteProduct  -> DELETE /api/admin/products/:id
 * ------------------------------------------------------------------
 * Unlike the seller's own product routes, these work on ANY product
 * regardless of which shop it belongs to.
 */

// 1. See every product across every shop, including inactive ones
export const getAllProductsAdmin = async (req, res, next) => {
  try {
    const { shop, isActive, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (shop) query.shop = shop;
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (search) query.$text = { $search: search };

    const safeLimit = Math.min(Number(limit) || 20, 100);

    const products = await Product.find(query)
      .populate("shop", "shopName slug")
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * safeLimit)
      .limit(safeLimit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / safeLimit),
    });
  } catch (error) {
    next(error);
  }
};

// 2. Force show/hide any product (policy violation, counterfeit, complaints)
export const forceToggleProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({ _id: product._id, isActive: product.isActive });
  } catch (error) {
    next(error);
  }
};

// 3. Permanently remove a product (severe violations only - prefer toggle-active for most cases)
export const forceDeleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    await product.deleteOne();
    res.json({ message: "Product permanently deleted by admin" });
  } catch (error) {
    next(error);
  }
};
