import Shop from "../../shop/models/shop.model.js";
import { NotFoundError } from "../../../exceptions/ApiError.js";

/**
 * ADMIN - SHOP MANAGEMENT
 * ------------------------------------------------------------------
 *   1. getAllShopsAdmin  -> GET   /api/admin/shops        (sees inactive shops too)
 *   2. verifyShop        -> PATCH /api/admin/shops/:id/verify
 *   3. forceToggleShop   -> PATCH /api/admin/shops/:id/toggle-active
 * ------------------------------------------------------------------
 * Note: the public shop routes (modules/shop) intentionally only
 * show active shops. These admin routes bypass that restriction.
 */

// 1. Get every shop regardless of isActive - admin needs full visibility
export const getAllShopsAdmin = async (req, res, next) => {
  try {
    const { isVerified, isActive, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (isVerified !== undefined) query.isVerified = isVerified === "true";
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (search) query.shopName = { $regex: search, $options: "i" };

    const safeLimit = Math.min(Number(limit) || 20, 100);

    const shops = await Shop.find(query)
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * safeLimit)
      .limit(safeLimit);

    const total = await Shop.countDocuments(query);

    res.json({ shops, total, page: Number(page), pages: Math.ceil(total / safeLimit) });
  } catch (error) {
    next(error);
  }
};

// 2. Mark a shop as verified (e.g. after checking GST/business documents)
export const verifyShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    shop.isVerified = true;
    await shop.save();

    res.json({ _id: shop._id, isVerified: shop.isVerified });
  } catch (error) {
    next(error);
  }
};

// 3. Force-deactivate any shop (policy violation, fraud, complaints) - unlike the
//    seller's own toggle, this works regardless of who owns it
export const forceToggleShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    shop.isActive = !shop.isActive;
    await shop.save();

    res.json({ _id: shop._id, isActive: shop.isActive });
  } catch (error) {
    next(error);
  }
};