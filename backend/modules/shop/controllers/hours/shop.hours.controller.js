import Shop from "../../models/shop.model.js";
import { NotFoundError } from "../../../../exceptions/ApiError.js";
import {
  applyBusinessHoursUpdate,
  applyHolidayDateChange,
} from "../../services/shopHours.service.js";

// @desc    Update business hours for one or more days
//          Body shape: { monday: { open: "09:00", close: "21:00", isClosed: false }, ... }
// @route   PUT /api/shops/me/hours
// @access  Private
export const updateBusinessHours = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    applyBusinessHoursUpdate(shop, req.body); // all validation + rules live in the service
    await shop.save();

    res.json({ businessHours: shop.businessHours });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or remove specific holiday/closed dates (festivals, personal leave)
//          Body: { action: "add" | "remove", date: "2026-08-15" }
// @route   PATCH /api/shops/me/holidays
// @access  Private
export const updateHolidayDates = async (req, res, next) => {
  try {
    const { action, date } = req.body;

    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    applyHolidayDateChange(shop, action, date);
    await shop.save();

    res.json({ holidayDates: shop.holidayDates });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if a shop is currently open (public - shown on dukan page)
// @route   GET /api/shops/:slug/is-open
// @access  Public
export const checkShopIsOpen = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({
      slug: req.params.slug.toLowerCase(),
      isActive: true,
    });
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    res.json({
      slug: shop.slug,
      isOpen: shop.isCurrentlyOpen(), // this one stays a model method - it only needs the doc's own data
      businessHours: shop.businessHours,
    });
  } catch (error) {
    next(error);
  }
};
