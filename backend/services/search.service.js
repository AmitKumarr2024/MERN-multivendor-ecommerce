import Product from "../modules/product/models/product.model.js";
import Category from "../modules/product/models/category.model.js";

/**
 * SEARCH SERVICE
 * ------------------------------------------------------------------
 * MongoDB $text search is exact-word based - "aple" won't match "apple".
 * Strategy: try $text first (fast, relevance-scored via the weighted
 * index on Product), and if it returns few/no results, fall back to a
 * case-insensitive regex scan - catches typos and partial matches.
 * ------------------------------------------------------------------
 */

const MIN_RESULTS_BEFORE_FALLBACK = 3;

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const searchProducts = async (query, { page = 1, limit = 20 } = {}) => {
  const safeLimit = Math.min(Number(limit) || 20, 100);
  const currentPage = Math.max(Number(page) || 1, 1);
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return { products: [], total: 0, page: currentPage, pages: 0 };
  }

  let products = await Product.find(
    { $text: { $search: trimmedQuery }, isActive: true },
    { score: { $meta: "textScore" } },
  )
    .populate("shop", "shopName slug logo")
    .populate("category", "name slug")
    .sort({ score: { $meta: "textScore" } })
    .skip((currentPage - 1) * safeLimit)
    .limit(safeLimit);

  let total = await Product.countDocuments({
    $text: { $search: trimmedQuery },
    isActive: true,
  });

  if (total < MIN_RESULTS_BEFORE_FALLBACK) {
    const regex = new RegExp(escapeRegex(trimmedQuery), "i");
    const regexQuery = {
      isActive: true,
      $or: [{ name: regex }, { description: regex }],
    };

    products = await Product.find(regexQuery)
      .populate("shop", "shopName slug logo")
      .populate("category", "name slug")
      .sort({ averageRating: -1, createdAt: -1 })
      .skip((currentPage - 1) * safeLimit)
      .limit(safeLimit);

    total = await Product.countDocuments(regexQuery);
  }

  return {
    products,
    total,
    page: currentPage,
    pages: Math.ceil(total / safeLimit),
  };
};

export const getSearchSuggestions = async (query, limit = 6) => {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 2) {
    return { products: [], categories: [] };
  }

  const prefixRegex = new RegExp("^" + escapeRegex(trimmedQuery), "i");
  const looseRegex = new RegExp(escapeRegex(trimmedQuery), "i");

  const [prefixMatches, categoryMatches] = await Promise.all([
    Product.find({ isActive: true, name: prefixRegex })
      .select("name images price discountPrice")
      .limit(limit),
    Category.find({ isActive: true, name: looseRegex })
      .select("name slug")
      .limit(3),
  ]);

  let products = prefixMatches;
  if (products.length < limit) {
    const excludeIds = products.map((p) => p._id);
    const extra = await Product.find({
      isActive: true,
      name: looseRegex,
      _id: { $nin: excludeIds },
    })
      .select("name images price discountPrice")
      .limit(limit - products.length);
    products = [...products, ...extra];
  }

  return { products, categories: categoryMatches };
};

export const getTrendingSearches = async (limit = 8) => {
  const topProducts = await Product.find({ isActive: true })
    .select("name")
    .sort({ reviewCount: -1, averageRating: -1 })
    .limit(limit);

  return topProducts.map((p) => p.name);
};

export const getSearchFallbackSuggestions = async (query) => {
  const trimmedQuery = query.trim();
  const words = trimmedQuery.split(/\s+/).filter(Boolean);

  if (words.length === 0) return { categories: [], popularProducts: [] };

  const categoryRegexes = words.map((w) => new RegExp(escapeRegex(w), "i"));
  const categories = await Category.find({
    isActive: true,
    $or: categoryRegexes.map((r) => ({ name: r })),
  })
    .select("name slug")
    .limit(5);

  const popularProducts = await Product.find({ isActive: true })
    .select("name images price discountPrice")
    .sort({ reviewCount: -1 })
    .limit(6);

  return { categories, popularProducts };
};
