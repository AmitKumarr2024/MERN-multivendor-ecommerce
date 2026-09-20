import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * SHOP FOLLOW - one doc per (user, shop).
 * Following is only a "favorite" signal. It NEVER decides whether
 * someone is a Regular customer (derived from Order history instead,
 * see services/follow/customerStats.service.js).
 */
const shopFollowSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

shopFollowSchema.index({ user: 1, shop: 1 }, { unique: true });

export default mongoose.model("ShopFollow", shopFollowSchema);
