import Wishlist from "../models/wishlist.model.js";
import Product from "../../product/models/product.model.js";
import {
  BadRequestError,
  NotFoundError,
} from "../../../exceptions/ApiError.js";

/**
 * WISHLIST CONTROLLER
 * ------------------------------------------------------------------
 * New developer? This is the full list of what's available here:
 *
 *   1. getMyWishlist    -> GET    /api/wishlist
 *   2. addToWishlist    -> POST   /api/wishlist/items
 *   3. removeFromWishlist -> DELETE /api/wishlist/items/:productId
 *   4. checkWishlisted  -> GET    /api/wishlist/check/:productId
 *   5. clearWishlist    -> DELETE /api/wishlist
 * ------------------------------------------------------------------
 */

// Shared helper - finds or creates the user's wishlist (mirrors
// getOrCreateCart's pattern in cart.service.js so a user never gets a
// 404 just for not having added anything yet).
const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }
  return wishlist;
};

// 1. ----------------------------------------------------------------
// @desc    Get logged-in user's wishlist with populated product data
// @route   GET /api/wishlist
// @access  Private
export const getMyWishlist = async (req, res, next) => {
  try {
    const wishlist = await getOrCreateWishlist(req.user._id);

    const populated = await wishlist.populate({
      path: "products",
      select: "name images price discountPrice stock isActive shop",
      populate: { path: "shop", select: "shopName slug" },
    });

    res.json({ _id: populated._id, products: populated.products });
  } catch (error) {
    next(error);
  }
};

// 2. ----------------------------------------------------------------
// @desc    Add a product to the wishlist (no-op if already present)
// @route   POST /api/wishlist/items
// @access  Private
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      throw new BadRequestError("productId is required");
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError("Product not found");
    }

    const wishlist = await getOrCreateWishlist(req.user._id);

    const alreadyAdded = wishlist.products.some(
      (id) => id.toString() === productId,
    );
    if (!alreadyAdded) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    const populated = await wishlist.populate({
      path: "products",
      select: "name images price discountPrice stock isActive shop",
      populate: {
        path: "shop",
        select: "shopName slug",
      },
    });

    res.status(201).json({
      _id: populated._id,
      products: populated.products,
    });
  } catch (error) {
    next(error);
  }
};

// 3. ----------------------------------------------------------------
// @desc    Remove one product from the wishlist
// @route   DELETE /api/wishlist/items/:productId
// @access  Private
export const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await getOrCreateWishlist(req.user._id);

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== req.params.productId,
    );
    await wishlist.save();

    const populated = await wishlist.populate({
      path: "products",
      select: "name images price discountPrice stock isActive shop",
      populate: {
        path: "shop",
        select: "shopName slug",
      },
    });

    res.json({
      _id: populated._id,
      products: populated.products,
    });
  } catch (error) {
    next(error);
  }
};

// 4. ----------------------------------------------------------------
// @desc    Quick check - is this one product wishlisted? (for the heart
//          icon on product cards, without fetching the whole list)
// @route   GET /api/wishlist/check/:productId
// @access  Private
export const checkWishlisted = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({
      user: req.user._id,
      products: req.params.productId,
    }).select("_id");

    res.json({
      productId: req.params.productId,
      wishlisted: Boolean(wishlist),
    });
  } catch (error) {
    next(error);
  }
};

// 5. ----------------------------------------------------------------
// @desc    Empty the entire wishlist
// @route   DELETE /api/wishlist
// @access  Private
export const clearWishlist = async (req, res, next) => {
  try {
    const wishlist = await getOrCreateWishlist(req.user._id);
    wishlist.products = [];
    await wishlist.save();

    res.json({ _id: wishlist._id, products: wishlist.products });
  } catch (error) {
    next(error);
  }
};
