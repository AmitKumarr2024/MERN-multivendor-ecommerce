import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    // A conversation is always buyer <-> a specific shop (the shop owner replies on
    // behalf of the shop). One conversation per (buyer, shop) pair - reused for
    // all future messages instead of starting a new thread every time.
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },
    lastMessage: {
      text: String,
      sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      sentAt: Date,
    },
    // Unread counts per side, so each side's inbox can show a badge
    unreadCountForBuyer: { type: Number, default: 0 },
    unreadCountForSeller: { type: Number, default: 0 },
  },
  { timestamps: true },
);

conversationSchema.index({ buyer: 1, shop: 1 }, { unique: true });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
