import Product from "../models/product.model.js";
import Shop from "../../shop/models/shop.model.js";
import { NotFoundError } from "../../../exceptions/ApiError.js";
import {
  getEffectivePrice,
  getDiscountPercent,
} from "../../../services/pricing.service.js";
import Category from "../../product/models/category.model.js";

/**
 * PRODUCT READ CONTROLLER
 * ------------------------------------------------------------------
 * All "read/GET" operations related to Product live in this single file.
 * New developer? Start here — this is the full list of what's available:
 *
 *   1. getAllProducts        -> GET /api/products
 *                                Homepage feed: filter, search, sort, pagination
 *   2. getProductById         -> GET /api/products/:id
 *                                Single product detail page
 *   3. getProductsByShopSlug  -> GET /api/products/shop/:slug
 *                                All products of one specific dukan (public)
 *   4. getMyProducts          -> GET /api/products/me
 *                                Logged-in seller's own products (dashboard)
 *
 * Need to add a new read operation (e.g. "related products", "trending
 * products", "recently viewed")? Add it below with the same @desc/@route
 * comment style and update this index.
 * ------------------------------------------------------------------
 */

// Allowed sort options - whitelist keeps the query safe from arbitrary field injection
const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_low_to_high: { price: 1 },
  price_high_to_low: { price: -1 },
  name_a_to_z: { name: 1 },
};

// 1. ----------------------------------------------------------------
// @desc    Get all products for homepage feed (all shops combined)
//          Supports category filter, price range, text search, and sorting
// @route   GET /api/products?category=&search=&minPrice=&maxPrice=&sort=&page=&limit=
// @access  Public
export const getAllProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort = "newest",
      page = 1,
      limit = 20,
    } = req.query;

    const query = {
      isActive: true,
    };

    /* =====================================================
           CATEGORY FILTER

           Frontend sends category SLUG:

               ?category=tools

           Product.category stores Category._id.

           Therefore:

               tools
                 ↓
               Category.slug
                 ↓
               Category._id
                 ↓
               Product.category
        ===================================================== */

    if (category) {
      const categoryDoc = await Category.findOne({
        slug: String(category).toLowerCase(),
        isActive: true,
      });

      if (!categoryDoc) {
        return res.json({
          products: [],
          total: 0,
          page: Number(page),
          pages: 0,
          sort,
        });
      }

      query.category = categoryDoc._id;
    }

    /* =====================================================
           SEARCH
        ===================================================== */

    if (search) {
      query.$text = {
        $search: search,
      };
    }

    /* =====================================================
           PRICE FILTER
        ===================================================== */

    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }

    /* =====================================================
           PAGINATION
        ===================================================== */

    const safeLimit = Math.min(Number(limit) || 20, 100);

    const currentPage = Math.max(Number(page) || 1, 1);

    /* =====================================================
           SORT
        ===================================================== */

    const sortBy = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;

    /* =====================================================
           FETCH PRODUCTS
        ===================================================== */

    const products = await Product.find(query)
      .populate("shop", "shopName slug logo")
      .populate("category", "name slug")
      .sort(sortBy)
      .skip((currentPage - 1) * safeLimit)
      .limit(safeLimit);

    /* =====================================================
           TOTAL
        ===================================================== */

    const total = await Product.countDocuments(query);

    /* =====================================================
           RESPONSE
        ===================================================== */

    res.json({
      products,
      total,
      page: currentPage,
      pages: Math.ceil(total / safeLimit),
      sort,
    });
  } catch (error) {
    next(error);
  }
};

// 2. ----------------------------------------------------------------
// @desc    Get single product by id (product detail page)
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("shop", "shopName slug logo")
      .populate("category", "name slug");

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Attach computed pricing fields - business logic lives in the service,
    // controller just calls it and attaches the result to the response.
    const productData = product.toObject();
    productData.effectivePrice = getEffectivePrice(product);
    productData.discountPercent = getDiscountPercent(product);

    res.json(productData);
  } catch (error) {
    next(error);
  }
};

// 3. ----------------------------------------------------------------
// @desc    Get all products belonging to one shop (dukan page)
// @route   GET /api/products/shop/:slug
// @access  Public
export const getProductsByShopSlug = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ slug: req.params.slug.toLowerCase() });
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }
    const products = await Product.find({
      shop: shop._id,
      isActive: true,
    }).populate("category", "name slug");
    res.json({ shop, products });
  } catch (error) {
    next(error);
  }
};

// 4. ----------------------------------------------------------------
// @desc    Get logged-in seller's own products (for dashboard)
// @route   GET /api/products/me
// @access  Private (seller)
export const getMyProducts = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      throw new NotFoundError("You have not created a shop yet");
    }
    const products = await Product.find({ shop: shop._id }).populate(
      "category",
      "name slug",
    );
    res.json(products);
  } catch (error) {
    next(error);
  }
};
