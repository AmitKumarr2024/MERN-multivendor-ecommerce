import mongoose from "mongoose";

/**
 * NOTIFICATION MODEL
 * ------------------------------------------------------------------
 * Single collection for ALL notification types (order, offer, product,
 * shop, feedback, message, broadcast, system). `type` decides how the
 * frontend renders it (icon/color), `link` decides where clicking it
 * navigates to. `relatedId`/`relatedModel` let you populate the source
 * document later if ever needed, without needing a separate schema per type.
 * ------------------------------------------------------------------
 */

const NOTIFICATION_TYPES = [
  "order_placed", // seller: naya order aaya
  "order_status", // buyer: order confirmed/shipped/delivered/cancelled
  "new_offer", // shop broadcast/offer
  "new_product", // shop follow karne wale buyer ko naya product
  "new_shop", // (future) naya shop join hua nearby
  "feedback", // (future) review/rating related
  "message", // naya chat message
  "wishlist_price_drop", // (future)
  "system", // platform-wide announcement/admin toast
];

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    // Where frontend should navigate on click, e.g. "/buyer/orders/64f..."
    link: { type: String, default: null },
    // Optional reference back to the source doc (order, product, shop, etc.)
    relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
    relatedModel: {
      type: String,
      enum: ["Order", "Product", "Shop", "Conversation", null],
      default: null,
    },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

// Fast "unread count" + "recent list" queries — both filter by recipient
// and sort/filter by createdAt/isRead, so a compound index covers both.
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// Auto-delete notifications older than 60 days — keeps the collection from
// growing forever without needing a manual cleanup cron job.
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 60 },
);

export const NOTIFICATION_TYPES_LIST = NOTIFICATION_TYPES;

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
