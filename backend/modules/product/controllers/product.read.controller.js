import Product from "../models/product.model.js";
import Shop from "../../shop/models/shop.model.js";
import {
  NotFoundError,
  BadRequestError,
} from "../../../exceptions/ApiError.js";
import {
  getEffectivePrice,
  getDiscountPercent,
} from "../../../services/pricing.service.js";
import Category from "../../product/models/category.model.js";
import {
  searchProducts,
  getSearchSuggestions,
  getTrendingSearches,
  getSearchFallbackSuggestions,
} from "../../../services/search.service.js";

/**
 * PRODUCT READ CONTROLLER
 * ------------------------------------------------------------------
 * New developer? Start here — this is the full list of what's available:
 *
 *   1. getAllProducts          -> GET /api/products
 *   2. getProductById           -> GET /api/products/:id
 *   3. getProductsByShopSlug     -> GET /api/products/shop/:slug
 *   4. getMyProducts              -> GET /api/products/me
 *   5. getRelatedProducts          -> GET /api/products/:id/related
 *   6. searchProductsHandler        -> GET /api/products/search?q=
 *   7. searchSuggestionsHandler      -> GET /api/products/search/suggestions?q=
 *   8. trendingSearchesHandler        -> GET /api/products/search/trending
 * ------------------------------------------------------------------
 */

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

    const query = { isActive: true };

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

    // NOTE: this inline $text search stays for the homepage's simple filter
    // bar. For the robust typo-tolerant experience (autocomplete, fallback,
    // "did you mean"), use the dedicated /search endpoint below instead.
    if (search) {
      query.$text = { $search: search };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const safeLimit = Math.min(Number(limit) || 20, 100);
    const currentPage = Math.max(Number(page) || 1, 1);
    const sortBy = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;

    const products = await Product.find(query)
      .populate("shop", "shopName slug logo")
      .populate("category", "name slug")
      .sort(sortBy)
      .skip((currentPage - 1) * safeLimit)
      .limit(safeLimit);

    const total = await Product.countDocuments(query);

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

// 5. ----------------------------------------------------------------
// @desc    Get related/similar products - same category, top-rated first
// @route   GET /api/products/:id/related
// @access  Public
export const getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .populate("shop", "shopName slug logo")
      .populate("category", "name slug")
      .sort({ averageRating: -1, reviewCount: -1, createdAt: -1 })
      .limit(8);

    res.json(related);
  } catch (error) {
    next(error);
  }
};

// 6. ----------------------------------------------------------------
// @desc    Robust search - typo-tolerant, relevance-ranked, with zero-result fallback
// @route   GET /api/products/search?q=&page=&limit=
// @access  Public
export const searchProductsHandler = async (req, res, next) => {
  try {
    const { q, page, limit } = req.query;
    if (!q || !q.trim()) {
      throw new BadRequestError("Search query is required");
    }

    const result = await searchProducts(q, { page, limit });

    if (result.total === 0) {
      result.suggestions = await getSearchFallbackSuggestions(q);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// 7. ----------------------------------------------------------------
// @desc    Autocomplete suggestions as the user types
// @route   GET /api/products/search/suggestions?q=
// @access  Public
export const searchSuggestionsHandler = async (req, res, next) => {
  try {
    const { q } = req.query;
    const result = await getSearchSuggestions(q || "");
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// 8. ----------------------------------------------------------------
// @desc    Trending search terms - shown when search box is empty
// @route   GET /api/products/search/trending
// @access  Public
export const trendingSearchesHandler = async (req, res, next) => {
  try {
    const trending = await getTrendingSearches();
    res.json({ trending });
  } catch (error) {
    next(error);
  }
};
