import mongoose from "mongoose";
const { Schema } = mongoose;

// STATUS LIFECYCLE
// pending -> confirmed -> ready -> collected      (happy path)
// pending -> cancelled                             (seller rejects, or buyer/seller cancels)
// confirmed/ready -> cancelled                     (buyer/seller cancels before pickup)
// pending -> expired                               (buyer never confirmed by seller in time)
// confirmed/ready -> expired                        (buyer never picked up by pickupDeadline)
const reservationSchema = new Schema(
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
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    variantId: { type: Schema.Types.ObjectId, default: null },

    quantity: { type: Number, required: true, min: 1 },

    // Snapshot fields - so the reservation stays meaningful even if the
    // product is edited/deleted later, same reasoning as Order.items.
    productName: { type: String, required: true },
    productImage: { type: String, default: "" },
    variantLabel: { type: String, default: null }, // e.g. "Red / M"
    unitPrice: { type: Number, required: true },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "ready",
        "collected",
        "cancelled",
        "expired",
      ],
      default: "pending",
      index: true,
    },

    // Whether this reservation currently holds stock (reservedStock on the
    // product). True for pending/confirmed/ready, false once resolved.
    holdsStock: { type: Boolean, default: true },

    expiresAt: { type: Date, required: true }, // seller must confirm/reject before this
    pickupDeadline: { type: Date, default: null }, // set on confirm - buyer must collect by this

    confirmedAt: { type: Date, default: null },
    readyAt: { type: Date, default: null },
    collectedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancelledBy: {
      type: String,
      enum: ["buyer", "seller", "system"],
      default: null,
    },
    cancelReason: { type: String, trim: true, maxlength: 300, default: null },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 300,
      default: null,
    },
  },
  { timestamps: true },
);

reservationSchema.index({ shop: 1, status: 1, createdAt: -1 });
reservationSchema.index({ buyer: 1, status: 1, createdAt: -1 });
// Fast lazy-expiry scan
reservationSchema.index({ status: 1, expiresAt: 1 });
reservationSchema.index({ status: 1, pickupDeadline: 1 });

export default mongoose.model("Reservation", reservationSchema);
