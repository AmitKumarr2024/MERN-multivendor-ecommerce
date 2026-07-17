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
    // Populated automatically by the logistics module once the seller marks
    // the order ready to ship - the seller never picks a courier themselves,
    // services/logistics/logistics.service.js auto-selects one.
    shipment: {
      provider: { type: String, default: null }, // "shiprocket", "nimbuspost", etc.
      courierName: { type: String, default: null }, // e.g. "Delhivery Surface" - the actual carrier, resolved via the provider
      shipmentId: { type: String, default: null }, // provider's internal shipment/order id
      awbCode: { type: String, default: null }, // airway bill number - what the courier + customer use to track
      trackingId: { type: String, default: null }, // kept for backward compatibility, mirrors awbCode
      rate: { type: Number, default: null }, // what the platform paid the courier for this shipment
      estimatedDeliveryDays: { type: Number, default: null },
      status: { type: String, default: null }, // "pickup_scheduled" | "in_transit" | "out_for_delivery" | "delivered" | "returned" | etc.
      trackingUrl: { type: String, default: null },
      lastWebhookAt: { type: Date, default: null },
      history: [
        {
          _id: false,
          status: String,
          message: String,
          occurredAt: Date,
        },
      ],
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
