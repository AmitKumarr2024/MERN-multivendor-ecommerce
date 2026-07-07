import Shop from "../../models/shop.model.js";
import { BadRequestError, NotFoundError } from "../../../../exceptions/ApiError.js";

// @desc    Check if a custom shop URL/slug is available before submitting
//          (used by frontend for real-time "is this URL free?" validation)
// @route   GET /api/shops/slug-check/:slug
// @access  Public
export const checkSlugAvailability = async (req, res, next) => {
  try {
    const slug = req.params.slug.toLowerCase();

    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new BadRequestError("Shop URL can only contain lowercase letters, numbers, and hyphens");
    }

    const existing = await Shop.findOne({ slug });
    res.json({ slug, available: !existing });
  } catch (error) {
    next(error);
  }
};

// @desc    Change the seller's custom shop URL (slug)
// @route   PUT /api/shops/me/slug
// @access  Private
export const updateShopSlug = async (req, res, next) => {
  try {
    const { slug } = req.body;

    if (!slug) {
      throw new BadRequestError("New shop URL is required");
    }

    const normalizedSlug = slug.toLowerCase().trim();

    if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
      throw new BadRequestError("Shop URL can only contain lowercase letters, numbers, and hyphens");
    }

    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    if (normalizedSlug === shop.slug) {
      return res.json(shop); // no change needed
    }

    const slugTaken = await Shop.findOne({ slug: normalizedSlug, _id: { $ne: shop._id } });
    if (slugTaken) {
      throw new BadRequestError("This shop URL is already taken");
    }

    shop.slug = normalizedSlug;
    await shop.save();

    res.json(shop);
  } catch (error) {
    next(error);
  }
};