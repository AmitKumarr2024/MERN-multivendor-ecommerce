import mongoose from "mongoose";

const broadcastSchema = new mongoose.Schema(
  {
    // "shop"     -> posted by a seller, shown only to visitors of that seller's dukan page
    // "platform" -> posted by an admin, shown as a toast to every visitor site-wide
    scope: {
      type: String,
      enum: ["shop", "platform"],
      required: true,
      index: true,
    },
    // Only set when scope === "shop"
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      default: null,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: [true, "Broadcast message is required"],
      trim: true,
      maxlength: 300,
    },
    // Visual hint for the frontend toast/banner styling: "info" | "offer" | "warning"
    type: {
      type: String,
      enum: ["info", "offer", "warning"],
      default: "offer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Optional auto-expiry - e.g. a flash sale banner that disappears after 24h
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const Broadcast = mongoose.model("Broadcast", broadcastSchema);

export default Broadcast;
