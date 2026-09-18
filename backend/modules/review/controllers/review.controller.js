import {
  createReview,
  getProductReviews,
  getReviewableOrdersForProduct,
  updateReview,
  deleteReview,
  replyToReview,
  markReviewHelpful,
} from "../../../services/review.service.js";

/**
 * REVIEW CONTROLLER
 * ------------------------------------------------------------------
 *   1. writeReview           -> POST   /api/products/:productId/reviews
 *   2. listProductReviews     -> GET    /api/products/:productId/reviews
 *   3. getReviewEligibility    -> GET    /api/products/:productId/reviews/eligibility
 *   4. editMyReview             -> PUT    /api/reviews/:id
 *   5. removeReview               -> DELETE /api/reviews/:id
 *   6. sellerReply                  -> POST   /api/reviews/:id/reply
 *   7. voteHelpful                   -> PATCH  /api/reviews/:id/helpful
 * ------------------------------------------------------------------
 */

// 1. -------------------------------------------------------------
// @desc    Write a review (verified purchase only)
// @route   POST /api/products/:productId/reviews
// @access  Private (buyer)
export const writeReview = async (req, res, next) => {
  try {
    const review = await createReview(req.user._id, {
      productId: req.params.productId,
      orderId: req.body.orderId,
      rating: req.body.rating,
      comment: req.body.comment,
      images: req.body.images,
    });
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

// 2. -------------------------------------------------------------
// @desc    List reviews for a product (with rating breakdown)
// @route   GET /api/products/:productId/reviews?page=&limit=&sort=
// @access  Public
export const listProductReviews = async (req, res, next) => {
  try {
    const { page, limit, sort } = req.query;
    const result = await getProductReviews(req.params.productId, {
      page,
      limit,
      sort,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// 3. -------------------------------------------------------------
// @desc    Check if the logged-in buyer can review this product, and
//          from which order(s) - drives the "Write a review" button
// @route   GET /api/products/:productId/reviews/eligibility
// @access  Private (buyer)
export const getReviewEligibility = async (req, res, next) => {
  try {
    const eligibleOrders = await getReviewableOrdersForProduct(
      req.user._id,
      req.params.productId,
    );
    res.json({ canReview: eligibleOrders.length > 0, eligibleOrders });
  } catch (error) {
    next(error);
  }
};

// 4. -------------------------------------------------------------
// @desc    Edit your own review
// @route   PUT /api/reviews/:id
// @access  Private (buyer - own review only)
export const editMyReview = async (req, res, next) => {
  try {
    const review = await updateReview(req.params.id, req.user._id, {
      rating: req.body.rating,
      comment: req.body.comment,
      images: req.body.images,
    });
    res.json(review);
  } catch (error) {
    next(error);
  }
};

// 5. -------------------------------------------------------------
// @desc    Delete a review - own review (buyer) or any review (admin)
// @route   DELETE /api/reviews/:id
// @access  Private (buyer own, or admin)
export const removeReview = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === "admin";
    await deleteReview(req.params.id, req.user._id, isAdmin);
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// 6. -------------------------------------------------------------
// @desc    Seller replies to a review on their own product's listing
// @route   POST /api/reviews/:id/reply
// @access  Private (seller - owner of the product only)
export const sellerReply = async (req, res, next) => {
  try {
    const review = await replyToReview(
      req.params.id,
      req.user._id,
      req.body.text,
    );
    res.json(review);
  } catch (error) {
    next(error);
  }
};

// 7. -------------------------------------------------------------
// @desc    Mark a review as helpful (simple counter, no per-user tracking)
// @route   PATCH /api/reviews/:id/helpful
// @access  Private (any logged-in user)
export const voteHelpful = async (req, res, next) => {
  try {
    const review = await markReviewHelpful(req.params.id);
    res.json({ _id: review._id, helpfulCount: review.helpfulCount });
  } catch (error) {
    next(error);
  }
};
