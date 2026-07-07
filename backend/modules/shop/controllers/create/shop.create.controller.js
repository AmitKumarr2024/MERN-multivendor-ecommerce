import Shop from "../../models/shop.model.js";
import User from "../../../auth/auth.model.js";
import { ROLES } from "../../../../constants/roles.js";
import { BadRequestError } from "../../../../exceptions/ApiError.js";

// @desc    Create a new shop (dukan) - one shop per user
// @route   POST /api/shops
// @access  Private
export const createShop = async (req, res, next) => {
  try {
    const { shopName, slug, description, logo, banner, address, contactPhone, contactEmail } = req.body;

    if (!shopName) {
      throw new BadRequestError("Shop name is required");
    }

    const existingShop = await Shop.findOne({ owner: req.user._id });
    if (existingShop) {
      throw new BadRequestError("You already have a shop");
    }

    if (slug) {
      const slugTaken = await Shop.findOne({ slug: slug.toLowerCase() });
      if (slugTaken) {
        throw new BadRequestError("This shop URL is already taken, please choose another");
      }
    }

    const shop = await Shop.create({
      owner: req.user._id,
      shopName,
      slug: slug ? slug.toLowerCase() : undefined,
      description,
      logo,
      banner,
      address,
      contactPhone,
      contactEmail,
    });

    // Link shop to user + upgrade role to seller
    await User.findByIdAndUpdate(req.user._id, { shop: shop._id, role: ROLES.SELLER });

    res.status(201).json(shop);
  } catch (error) {
    next(error);
  }
};