import mongoose from "mongoose";
import Review from "../modules/review/models/review.model.js";
import Order from "../modules/order/models/order.model.js";
import Product from "../modules/product/models/product.model.js";
import Shop from "../modules/shop/models/shop.model.js";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../exceptions/ApiError.js";
import { createNotification } from "./notification.service.js";

/**
 * REVIEW SERVICE
 * ------------------------------------------------------------------
 * Business rules for reviews live here - controllers just call these.
 *   - createReview()   verifies purchase, creates review, recomputes
 *                        product rating, notifies the seller
 *   - recomputeProductRating()  denormalizes averageRating/reviewCount
 *                        onto Product so product-list queries don't
 *                        need a $lookup/aggregate every time
 * ------------------------------------------------------------------
 */

// Recalculates and stores averageRating/reviewCount on the Product doc.
// Called after any review create/update/delete so the cached fields
// never drift from the actual Review collection.
export const recomputeProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(productId, {
    averageRating: stats[0]?.avg ? Number(stats[0].avg.toFixed(1)) : 0,
    reviewCount: stats[0]?.count || 0,
  });
};

export const createReview = async (
  buyerId,
  { productId, orderId, rating, comment, images },
) => {
  if (!productId || !orderId || !rating) {
    throw new BadRequestError("productId, orderId and rating are required");
  }
  if (rating < 1 || rating > 5) {
    throw new BadRequestError("Rating must be between 1 and 5");
  }

  // Verified-purchase check: the order must belong to this buyer, be
  // delivered, and actually contain this product. This is the single
  // most important guard in this whole module - without it anyone
  // could review anything.
  const order = await Order.findOne({
    _id: orderId,
    buyer: buyerId,
    orderStatus: "delivered",
    "items.product": productId,
  });

  if (!order) {
    throw new BadRequestError(
      "You can only review products from a delivered order you purchased",
    );
  }

  let review;
  try {
    review = await Review.create({
      product: productId,
      buyer: buyerId,
      order: orderId,
      rating,
      comment,
      images,
    });
  } catch (error) {
    // Duplicate key error = they already reviewed this exact (product, order)
    if (error.code === 11000) {
      throw new BadRequestError(
        "You have already reviewed this product for this order",
      );
    }
    throw error;
  }

  await recomputeProductRating(productId);

  // Notify the seller - a new review is worth knowing about, especially
  // low ratings which might need a reply/attention
  const product = await Product.findById(productId);
  if (product) {
    const shop = await Shop.findById(product.shop);
    if (shop) {
      await createNotification({
        recipient: shop.owner,
        type: "feedback",
        title:
          rating <= 2 ? "New review needs attention" : "New review received",
        message: `${rating}★ review on "${product.name}"${comment ? `: "${comment.slice(0, 60)}${comment.length > 60 ? "..." : ""}"` : ""}`,
        link: `/seller/products/${product._id}`,
        relatedId: review._id,
        relatedModel: "Product",
      });
    }
  }

  return review;
};

export const getProductReviews = async (
  productId,
  { page = 1, limit = 10, sort = "newest" } = {},
) => {
  const SORT_OPTIONS = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    highest: { rating: -1, createdAt: -1 },
    lowest: { rating: 1, createdAt: -1 },
    helpful: { helpfulCount: -1, createdAt: -1 },
  };

  const safeLimit = Math.min(Number(limit) || 10, 50);
  const currentPage = Math.max(Number(page) || 1, 1);

  const [reviews, total, ratingBreakdown] = await Promise.all([
    Review.find({ product: productId })
      .populate("buyer", "name avatar")
      .sort(SORT_OPTIONS[sort] || SORT_OPTIONS.newest)
      .skip((currentPage - 1) * safeLimit)
      .limit(safeLimit),
    Review.countDocuments({ product: productId }),
    // Star-by-star breakdown for the "5★ ████░ 12" style bar chart
    Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]),
  ]);

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const entry of ratingBreakdown) {
    breakdown[entry._id] = entry.count;
  }

  return {
    reviews,
    total,
    page: currentPage,
    pages: Math.ceil(total / safeLimit),
    ratingBreakdown: breakdown,
  };
};

// Checks whether the logged-in buyer is eligible to review this product
// right now, and for which order(s) - used by the frontend to decide
// whether to show a "Write a review" button on a delivered order.
export const getReviewableOrdersForProduct = async (buyerId, productId) => {
  const deliveredOrders = await Order.find({
    buyer: buyerId,
    orderStatus: "delivered",
    "items.product": productId,
  }).select("_id createdAt");

  const alreadyReviewedOrderIds = new Set(
    (
      await Review.find({ buyer: buyerId, product: productId }).select("order")
    ).map((r) => r.order.toString()),
  );

  return deliveredOrders
    .filter((order) => !alreadyReviewedOrderIds.has(order._id.toString()))
    .map((order) => ({ orderId: order._id, deliveredOn: order.createdAt }));
};

export const updateReview = async (
  reviewId,
  buyerId,
  { rating, comment, images },
) => {
  const review = await Review.findOne({ _id: reviewId, buyer: buyerId });
  if (!review) {
    throw new NotFoundError("Review not found");
  }

  if (rating !== undefined) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestError("Rating must be between 1 and 5");
    }
    review.rating = rating;
  }
  if (comment !== undefined) review.comment = comment;
  if (images !== undefined) review.images = images;

  await review.save();
  await recomputeProductRating(review.product);

  return review;
};

export const deleteReview = async (reviewId, userId, isAdmin = false) => {
  const query = isAdmin ? { _id: reviewId } : { _id: reviewId, buyer: userId };
  const review = await Review.findOneAndDelete(query);

  if (!review) {
    throw new NotFoundError("Review not found");
  }

  await recomputeProductRating(review.product);
  return review;
};

// Seller replies to a review on their own product - one reply per review,
// re-calling this overwrites the previous reply rather than threading
export const replyToReview = async (reviewId, sellerId, text) => {
  if (!text?.trim()) {
    throw new BadRequestError("Reply text is required");
  }

  const review = await Review.findById(reviewId).populate("product");
  if (!review) {
    throw new NotFoundError("Review not found");
  }

  const shop = await Shop.findOne({ owner: sellerId });
  if (!shop || review.product.shop.toString() !== shop._id.toString()) {
    throw new ForbiddenError("You are not allowed to reply to this review");
  }

  review.sellerReply = { text: text.trim(), repliedAt: new Date() };
  await review.save();

  // Let the buyer know the seller responded
  await createNotification({
    recipient: review.buyer,
    type: "feedback",
    title: "Seller replied to your review",
    message: text.trim().slice(0, 80),
    link: `/products/${review.product._id}`,
    relatedId: review._id,
    relatedModel: "Product",
  });

  return review;
};

export const markReviewHelpful = async (reviewId) => {
  const review = await Review.findByIdAndUpdate(
    reviewId,
    { $inc: { helpfulCount: 1 } },
    { new: true },
  );
  if (!review) {
    throw new NotFoundError("Review not found");
  }
  return review;
};
