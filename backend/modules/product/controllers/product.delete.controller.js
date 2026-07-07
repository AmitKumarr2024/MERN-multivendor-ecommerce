import Product from "../models/product.model.js";
import Shop from "../../shop/models/shop.model.js";
import { NotFoundError, ForbiddenError } from "../../../exceptions/ApiError.js";

// @desc    Delete product (only owner seller)
// @route   DELETE /api/products/:id
// @access  Private (seller)
export const deleteProduct = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new NotFoundError("Product not found");
    }
    if (!shop || product.shop.toString() !== shop._id.toString()) {
      throw new ForbiddenError("You are not allowed to delete this product");
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};
