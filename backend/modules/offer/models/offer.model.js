import mongoose from "mongoose";
const { Schema } = mongoose;

const offerSchema = new Schema(
  {
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },
    code: { type: String, required: true, trim: true, uppercase: true },
    description: { type: String, trim: true, maxlength: 300 },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    maxDiscountAmount: { type: Number, default: null, min: 0 }, // percentage only
    scope: {
      type: String,
      enum: ["shop", "category", "product"],
      default: "shop",
    },
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    usageLimit: { type: Number, default: null, min: 1 }, // null = unlimited
    perCustomerLimit: { type: Number, default: 1, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 }, // denormalized, only writeEntry-style guarded $inc touches this
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// One code per shop
offerSchema.index({ shop: 1, code: 1 }, { unique: true });

offerSchema.methods.isWithinDateWindow = function (now = new Date()) {
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  return true;
};

export default mongoose.model("Offer", offerSchema);
