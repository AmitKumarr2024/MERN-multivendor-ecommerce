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
      throw new BadRequestError(
        "Please create your shop before adding products",
      );
    }

    const {
      name,
      description,
      specifications,
      price,
      discountPrice,
      images,
      category,
      stock,
      weightKg,
      hasVariants,
      variants,
    } = req.body;

    if (!name || price === undefined || !category) {
      throw new BadRequestError("Name, price and category are required");
    }

    const categoryExists = await Category.findOne({
      slug: category.toLowerCase(),
    });
    if (!categoryExists) {
      throw new BadRequestError("Invalid category");
    }

    // Agar hasVariants true hai, kam se kam ek variant hona chahiye
    // aur uska stock sahi honi chahiye - warna product "sellable" hi nahi hoga
    if (hasVariants) {
      if (!Array.isArray(variants) || variants.length === 0) {
        throw new BadRequestError(
          "At least one variant (e.g. a size/color combination) is required when variants are enabled",
        );
      }
    }

    const product = await Product.create({
      shop: shop._id,
      name,
      description,
      specifications: specifications || [],
      price,
      discountPrice,
      images,
      category: categoryExists._id,
      stock: hasVariants ? 0 : stock, // flat stock irrelevant when variants exist
      weightKg,
      hasVariants: !!hasVariants,
      variants: hasVariants ? variants : [],
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};
