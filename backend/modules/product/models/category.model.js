import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    // supports nested categories, e.g. Electronics -> Mobiles -> Smartphones
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    image: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

categorySchema.pre("validate", function () {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    });
  }
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
