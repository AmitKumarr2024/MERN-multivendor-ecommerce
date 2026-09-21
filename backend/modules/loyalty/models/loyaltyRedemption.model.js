import mongoose from "mongoose";
const { Schema } = mongoose;

const loyaltyRedemptionSchema = new Schema(
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
    points: { type: Number, required: true },
    value: { type: Number, required: true }, // ₹ value at time of redemption
    code: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["issued", "fulfilled"],
      default: "issued",
      index: true,
    },
    fulfilledAt: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model("LoyaltyRedemption", loyaltyRedemptionSchema);
