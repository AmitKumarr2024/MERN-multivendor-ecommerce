import mongoose from "mongoose";
const { Schema } = mongoose;

const khataSettlementSchema = new Schema(
  {
    khata: { type: Schema.Types.ObjectId, ref: "Khata", required: true, index: true },
    shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
    statementMonth: { type: String, required: true }, // "YYYY-MM"
    openingBalance: { type: Number, required: true },
    closingBalance: { type: Number, required: true },
    totalCredits: { type: Number, required: true },
    totalPayments: { type: Number, required: true },
    closedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

khataSettlementSchema.index({ khata: 1, statementMonth: 1 }, { unique: true });

export default mongoose.model("KhataSettlement", khataSettlementSchema);