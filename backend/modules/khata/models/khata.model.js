import mongoose from "mongoose";
const { Schema } = mongoose;

const khataSchema = new Schema(
  {
    shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
      index: true,
    },
    creditLimit: { type: Number, default: 0, min: 0 },
    // Denormalized running balance — positive = buyer owes shop.
    // Recomputed from KhataTransaction sum, same pattern as Staff's
    // ratingAverage denormalization.
    outstandingBalance: { type: Number, default: 0 },
    requestNote: { type: String, trim: true, maxlength: 300 }, // buyer's note on apply
    rejectionReason: { type: String, trim: true, maxlength: 300 },
    approvedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" }, // seller/staff who approved
    suspendedAt: { type: Date },
    suspendedReason: { type: String, trim: true, maxlength: 300 },
    lastSettledAt: { type: Date }, // last month-close, does NOT delete history
  },
  { timestamps: true }
);

// One khata account per (shop, buyer) — this enforces "shop-specific" rule
khataSchema.index({ shop: 1, buyer: 1 }, { unique: true });

khataSchema.methods.availableCredit = function () {
  return Math.max(0, this.creditLimit - this.outstandingBalance);
};

khataSchema.methods.isUsable = function () {
  return this.status === "approved";
};

export default mongoose.model("Khata", khataSchema);