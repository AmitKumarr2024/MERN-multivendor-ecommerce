import mongoose from "mongoose";
const { Schema } = mongoose;

// One row per (offer, order) — the audit trail + the thing per-customer
// and total-usage limits are actually counted from. Never deleted;
// cancellation sets reversedAt instead (same "history is permanent"
// rule as KhataTransaction).
const offerRedemptionSchema = new Schema(
  {
    offer: {
      type: Schema.Types.ObjectId,
      ref: "Offer",
      required: true,
      index: true,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    discountAmount: { type: Number, required: true },
    reversedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

offerRedemptionSchema.index({ offer: 1, order: 1 }, { unique: true });
offerRedemptionSchema.index({ offer: 1, buyer: 1 });

export default mongoose.model("OfferRedemption", offerRedemptionSchema);
