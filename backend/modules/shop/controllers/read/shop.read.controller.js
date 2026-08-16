import Shop from "../../models/shop.model.js";
import { NotFoundError } from "../../../../exceptions/ApiError.js";

// @desc    Get all active shops (directory listing)
// @route   GET /api/shops
// @access  Public
export const getAllShops = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (search) query.shopName = { $regex: search, $options: "i" };

    const safeLimit = Math.min(Number(limit) || 20, 100);

    const shops = await Shop.find(query)
      .select("shopName slug logo banner description")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * safeLimit)
      .limit(safeLimit);

    const total = await Shop.countDocuments(query);

    res.json({
      shops,
      total,
      page: Number(page),
      pages: Math.ceil(total / safeLimit),
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Get shop by slug (public dukan page - this is where supplier click redirects)
// @route   GET /api/shops/:slug
// @access  Public
export const getShopBySlug = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({
      slug: req.params.slug.toLowerCase(),
      isActive: true,
    }).populate("owner", "name email phone");

    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    // toObject() so we can attach a computed field alongside the document data
    const shopData = shop.toObject();
    shopData.isOpen = shop.isCurrentlyOpen();

    res.json(shopData);
  } catch (error) {
    next(error);
  }
};
// @desc    Get logged-in seller's own shop
// @route   GET /api/shops/me
// @access  Private
export const getMyShop = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      throw new NotFoundError("You have not created a shop yet");
    }
    res.json(shop);
  } catch (error) {
    next(error);
  }
};
