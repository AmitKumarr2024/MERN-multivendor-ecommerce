import mongoose from "mongoose";
const { Schema } = mongoose;

const loyaltyAccountSchema = new Schema(
  {
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
    balance: { type: Number, default: 0 }, // may go negative after a reversal of spent points
    totalEarned: { type: Number, default: 0 },
    totalRedeemed: { type: Number, default: 0 },
    totalExpired: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// One account per (shop, buyer) - this enforces "points are shop-specific"
loyaltyAccountSchema.index({ shop: 1, buyer: 1 }, { unique: true });

export default mongoose.model("LoyaltyAccount", loyaltyAccountSchema);
