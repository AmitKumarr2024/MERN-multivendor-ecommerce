import mongoose from "mongoose";

// Ek variant = ek specific sellable combination (e.g. "Red / M").
// Stock aur price yahi decide karte hain jab hasVariants true ho.
const variantSchema = new mongoose.Schema(
  {
    color: { type: String, trim: true, default: null },
    size: { type: String, trim: true, default: null }, // "S","M","L","XL" ya "38","40" etc.
    sku: { type: String, trim: true, default: null },
    price: { type: Number, min: 0, default: null }, // null = product.price use karo
    discountPrice: { type: Number, min: 0, default: null },
    stock: { type: Number, required: true, default: 0, min: 0 },
    images: [{ type: String }], // color-specific images
    reservedStock: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }, // _id auto milta hai, variant select karne ke liye chahiye
);

const productSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },

    // Structured key-value specs - works for ANY category without a rigid
    // schema (electronics ke specs garment ke specs se poori tarah alag
    // hote hain, isliye fixed fields ki jagah free-form label/value pairs)
    specifications: [
      {
        _id: false,
        label: { type: String, required: true, trim: true }, // "Material", "RAM", "Brand"
        value: { type: String, required: true, trim: true },
      },
    ],

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    }, // base/starting price - agar hasVariants true hai to "Starting at ₹X" jaisa use hota hai
    discountPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    images: [{ type: String }], // default/main gallery images
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    }, // sirf tab use hota hai jab hasVariants=false

    // Variant support - garments (size/color), electronics (storage/color) etc.
    hasVariants: { type: Boolean, default: false },
    variants: [variantSchema],

    // Denormalized rating fields - review create/delete ke baad
    // review.service.js recompute karta hai. Aggregate query har product-read
    // pe chalana slow hoga, isliye yahi cache karke rakhte hain.
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    isActive: {
      type: Boolean,
      default: true,
    },
    weightKg: {
      type: Number,
      default: 0.5,
    },
    reservationEnabled: { type: Boolean, default: false },
    reservedStock: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

productSchema.index(
  { name: "text", description: "text" },
  { weights: { name: 10, description: 1 } },
);

// Total sellable stock - variant-level ya flat, jo bhi applicable ho.
// Frontend "in stock" badge aur homepage sort ke liye useful.
productSchema.methods.getTotalStock = function () {
  if (!this.hasVariants) return this.stock;
  return this.variants.reduce((sum, v) => sum + v.stock, 0);
};

// new instance methods, next to getTotalStock/getVariantById
productSchema.methods.getAvailableStock = function (variantId = null) {
  if (this.hasVariants) {
    const v = this.getVariantById(variantId);
    return v ? Math.max(0, v.stock - v.reservedStock) : 0;
  }
  return Math.max(0, this.stock - this.reservedStock);
};

// Ek specific variant dhoondhta hai uski _id se - cart/order me baar baar
// yahi lookup karna padta hai, isliye ek jagah define kar diya.
productSchema.methods.getVariantById = function (variantId) {
  if (!variantId) return null;
  return this.variants.id(variantId);
};

const Product = mongoose.model("Product", productSchema);

export default Product;
