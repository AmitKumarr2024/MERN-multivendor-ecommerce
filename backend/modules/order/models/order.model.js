import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    // Snapshot fields - captured at order time so later price/name changes
    // on the product don't alter historical orders
    name: { type: String, required: true },
    image: { type: String, default: "" },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // In a multi-vendor cart, checkout splits into one Order per shop -
    // this keeps each seller's dashboard scoped to only their own orders
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },
    items: [orderItemSchema],

    itemsSubtotal: { type: Number, required: true },
    tax: { type: Number, required: true, default: 0 },
    shippingCost: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    grandTotal: { type: Number, required: true },

    shippingAddress: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "razorpay"],
      default: "cod",
    },
    paymentId: { type: String, default: null }, // gateway transaction id, set once Razorpay is wired in

    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },

    // Placeholder for future Shiprocket integration - seller will pick a courier here
    shipment: {
      courierName: { type: String, default: null },
      trackingId: { type: String, default: null },
      status: { type: String, default: null },
    },

    cancelReason: { type: String, default: null },
    // Tracks whether stock has already been restored for this order (set true
    // by the cancel flow). Used by admin's force-delete to avoid double-restoring.
    stockRestored: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
