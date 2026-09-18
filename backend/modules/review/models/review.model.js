import mongoose from "mongoose";

/**
 * REVIEW MODEL
 * ------------------------------------------------------------------
 * "Verified purchase" reviews only - a buyer can review a product ONLY
 * if they have a delivered order containing that product. This is
 * enforced at the controller level (checked against Order), and the
 * compound unique index below prevents duplicate reviews for the same
 * (product, buyer, order) combination - so a buyer can't spam multiple
 * reviews for one purchase, but CAN review the same product again if
 * they buy it a second time in a different order.
 * ------------------------------------------------------------------
 */

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Ties the review to the specific order that proves purchase -
    // also lets the frontend show "Verified Purchase" badge
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    images: [{ type: String }], // buyer-uploaded photos of the product
    // Seller can reply once - keeps it simple (not a full comment thread)
    sellerReply: {
      text: { type: String, trim: true, maxlength: 500, default: null },
      repliedAt: { type: Date, default: null },
    },
    // Other buyers can mark a review "helpful" - simple upvote count,
    // no per-user tracking to keep this lightweight (matches the
    // project's "simple version first" philosophy)
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// One review per (product, buyer, order) - prevents duplicate/spam reviews
// for the same purchase while still allowing a re-review on a later reorder
reviewSchema.index({ product: 1, buyer: 1, order: 1 }, { unique: true });

// Fast "reviews for this product, newest first" queries
reviewSchema.index({ product: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
