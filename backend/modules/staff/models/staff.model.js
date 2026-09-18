import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    role: { type: String, required: true, trim: true, maxlength: 80 }, // e.g. "Tailor", "Delivery Lead"
    bio: { type: String, trim: true, maxlength: 500, default: "" },
    profilePhoto: {
      url: { type: String, default: null },
      publicId: { type: String, default: null }, // ⚠️ matches Cloudinary/Multer pattern used by upload.service.js
    },
    joiningDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true, index: true },

    // Denormalized public rating — recomputed by staff.service.js, mirrors
    // Product.averageRating/reviewCount pattern. Never write these directly
    // from anywhere except recomputeStaffRating().
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    feedbackCount: { type: Number, default: 0, min: 0 },

    removedAt: { type: Date, default: null }, // soft delete, keeps attendance/feedback history intact
  },
  { timestamps: true }
);

staffSchema.index({ shop: 1, isActive: 1, removedAt: 1 });

// Instance method — mirrors Product.getVariantById pattern: one correct
// place to compute "experience", don't hand-roll date math at call sites.
staffSchema.methods.getExperienceLabel = function () {
  const now = new Date();
  const start = this.joiningDate;
  let months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months -= 1;
  months = Math.max(months, 0);

  const years = Math.floor(months / 12);
  const remMonths = months % 12;

  if (years === 0 && remMonths === 0) return "New this month";
  if (years === 0) return `${remMonths} month${remMonths > 1 ? "s" : ""}`;
  if (remMonths === 0) return `${years} year${years > 1 ? "s" : ""}`;
  return `${years}y ${remMonths}m`;
};

staffSchema.methods.isRemoved = function () {
  return this.removedAt !== null;
};

export default mongoose.model("Staff", staffSchema);