import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import Shop from "../../shop/models/shop.model.js";
import { BadRequestError } from "../../../exceptions/ApiError.js";

// @desc    Create product (seller must already have a shop)
// @route   POST /api/products
// @access  Private (seller)
export const createProduct = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      throw new BadRequestError("Please create your shop before adding products");
    }

    const { name, description, price, discountPrice, images, category, stock, weightKg } = req.body;

    if (!name || price === undefined || !category) {
      throw new BadRequestError("Name, price and category are required");
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      throw new BadRequestError("Invalid category");
    }

    const product = await Product.create({
      shop: shop._id,
      name,
      description,
      price,
      discountPrice,
      images,
      category,
      stock,
      weightKg,
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};