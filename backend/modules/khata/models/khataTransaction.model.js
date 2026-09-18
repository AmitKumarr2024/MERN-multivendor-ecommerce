import mongoose from "mongoose";
const { Schema } = mongoose;

const khataTransactionSchema = new Schema(
  {
    khata: { type: Schema.Types.ObjectId, ref: "Khata", required: true, index: true },
    shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["credit_purchase", "payment", "adjustment"],
      required: true,
    },
    // Credit/purchase = positive, payment = negative, adjustment = signed
    amount: { type: Number, required: true },
    // Running balance AFTER this transaction — makes statements/history O(1) to render
    balanceAfter: { type: Number, required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order" }, // set only for credit_purchase from an order
    note: { type: String, trim: true, maxlength: 300 },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // seller for payment/adjustment, system for order-linked
    statementMonth: { type: String, required: true }, // "YYYY-MM", set at creation, immutable
    settledAt: { type: Date }, // set when the month this falls in gets closed — NEVER deleted
  },
  { timestamps: true }
);

khataTransactionSchema.index({ khata: 1, createdAt: 1 });
khataTransactionSchema.index({ khata: 1, statementMonth: 1 });

export default mongoose.model("KhataTransaction", khataTransactionSchema);