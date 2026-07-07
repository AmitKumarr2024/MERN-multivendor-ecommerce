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
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        throw new BadRequestError("Invalid category");
      }
    }

    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update stock only (dedicated endpoint - useful for quick inventory edits)
// @route   PATCH /api/products/:id/stock
// @access  Private (seller)
export const updateProductStock = async (req, res, next) => {
  try {
    const product = await assertOwnsProduct(req.user._id, req.params.id);

    // All the "what counts as valid stock" and "is this low stock" logic
    // lives in the service - the controller just wires request -> service -> response.
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

// @desc    Toggle product active/inactive (soft show/hide from storefront)
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
