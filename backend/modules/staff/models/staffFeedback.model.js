import mongoose from "mongoose";

const staffFeedbackSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
      index: true,
    },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    }, // proves the "legitimate interaction" — a delivered order from this shop
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500, default: "" },
  },
  { timestamps: true }
);

// One feedback per (staff, buyer, order) — same shape as Review's compound
// unique index. Allows fresh feedback on a reorder, blocks spam-resubmission
// against a single order.
staffFeedbackSchema.index({ staff: 1, buyer: 1, order: 1 }, { unique: true });

export default mongoose.model("StaffFeedback", staffFeedbackSchema);