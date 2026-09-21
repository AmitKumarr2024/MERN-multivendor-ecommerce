import mongoose from "mongoose";
const { Schema } = mongoose;

const loyaltyTransactionSchema = new Schema(
  {
    account: {
      type: Schema.Types.ObjectId,
      ref: "LoyaltyAccount",
      required: true,
    },
    shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["earn", "redeem", "reversal", "expire", "adjust"],
      required: true,
    },
    points: { type: Number, required: true }, // signed
    balanceAfter: { type: Number, required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    orderAmount: { type: Number }, // snapshot of what the earn was based on
    redemption: { type: Schema.Types.ObjectId, ref: "LoyaltyRedemption" },
    note: { type: String, trim: true, maxlength: 300 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // set for manual adjustments
    // Lot fields (earn / positive adjust only) - used for FIFO spending + expiry
    remaining: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    // Idempotency guard: "earn:<orderId>" / "reversal:<orderId>"
    dedupeKey: { type: String },
  },
  { timestamps: true },
);

loyaltyTransactionSchema.index(
  { dedupeKey: 1 },
  { unique: true, sparse: true },
);
loyaltyTransactionSchema.index({ account: 1, createdAt: -1 });
loyaltyTransactionSchema.index({ account: 1, remaining: 1, createdAt: 1 });

export default mongoose.model("LoyaltyTransaction", loyaltyTransactionSchema);
