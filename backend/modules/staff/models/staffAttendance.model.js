import mongoose from "mongoose";

const staffAttendanceSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
      index: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    }, // denormalized for cheap shop-wide queries, same pattern as Order snapshotting
    date: { type: Date, required: true }, // always normalized to UTC midnight, see service
    status: {
      type: String,
      enum: ["present", "absent", "leave"],
      required: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // the seller/owner who marked it — attendance is 100% seller-controlled
    note: { type: String, trim: true, maxlength: 200, default: "" },
  },
  { timestamps: true }
);

// One attendance record per staff per day — re-marking the same day is an
// update, not a new document. Enforced at DB level, not just app logic.
staffAttendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

export default mongoose.model("StaffAttendance", staffAttendanceSchema);