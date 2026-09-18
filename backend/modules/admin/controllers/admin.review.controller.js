import Review from "../../review/models/review.model.js";
import Product from "../../product/models/product.model.js";
import { NotFoundError } from "../../../exceptions/ApiError.js";
import { recomputeProductRating } from "../../../services/review.service.js";

/**
 * ADMIN - REVIEW MODERATION
 * ------------------------------------------------------------------
 *   1. getAllReviewsAdmin -> GET    /api/admin/reviews
 *   2. forceDeleteReview  -> DELETE /api/admin/reviews/:id
 * ------------------------------------------------------------------
 * Unlike the buyer's own review routes (modules/review), these work
 * on ANY review regardless of who wrote it. Used for taking down
 * abusive/spam/fake reviews - the buyer never gets a say once an
 * admin decides to remove one.
 */

// 1. See every review across every product - filterable by rating (e.g. find
//    all 1-star reviews to triage), or search by product/buyer name
export const getAllReviewsAdmin = async (req, res, next) => {
  try {
    const { rating, hasComment, page = 1, limit = 20 } = req.query;
    const query = {};

    if (rating) query.rating = Number(rating);
    // hasComment=false lets the admin find "silent" star-only reviews too,
    // hasComment=true filters to ones actually worth reading for moderation
    if (hasComment === "true") query.comment = { $exists: true, $ne: "" };
    if (hasComment === "false") {
      query.$or = [{ comment: { $exists: false } }, { comment: "" }];
    }

    const safeLimit = Math.min(Number(limit) || 20, 100);

    const reviews = await Review.find(query)
      .populate("product", "name images shop")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * safeLimit)
      .limit(safeLimit);

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      total,
      page: Number(page),
      pages: Math.ceil(total / safeLimit),
    });
  } catch (error) {
    next(error);
  }
};

// 2. Permanently remove any review (abusive, spam, fake, policy violation).
//    Always recomputes the product's averageRating/reviewCount afterward -
//    same rule as the buyer-facing delete path, so the denormalized fields
//    never go stale just because this went through the admin path instead.
export const forceDeleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      throw new NotFoundError("Review not found");
    }

    const productId = review.product;
    await review.deleteOne();
    await recomputeProductRating(productId);

    res.json({ message: "Review permanently deleted by admin" });
  } catch (error) {
    next(error);
  }
};