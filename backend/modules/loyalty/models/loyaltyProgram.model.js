import mongoose from "mongoose";
const { Schema } = mongoose;

const loyaltyProgramSchema = new Schema(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      unique: true,
    },
    enabled: { type: Boolean, default: false },
    pointsPerUnit: { type: Number, default: 1, min: 1 }, // points earned...
    spendAmount: { type: Number, default: 100, min: 1 }, // ...per this many ₹ spent
    minRedeemPoints: { type: Number, default: 100, min: 1 }, // cost of one reward
    rewardValue: { type: Number, default: 50, min: 1 }, // ₹ value of one reward
    expiryDays: { type: Number, default: null, min: 1 }, // null = never expire
  },
  { timestamps: true },
);

export default mongoose.model("LoyaltyProgram", loyaltyProgramSchema);
