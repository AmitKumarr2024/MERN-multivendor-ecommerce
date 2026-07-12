import mongoose from "mongoose";

/**
 * Tracks every uploaded image: who uploaded it, which folder/purpose it
 * belongs to, and its Cloudinary identifiers. This exists so DELETE
 * requests can verify the requester actually owns the image before
 * removing it - without this, any logged-in user could delete any image
 * on the platform just by knowing (or guessing) its publicId.
 */
const uploadSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true, unique: true, index: true },
    folder: { type: String, required: true },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

const Upload = mongoose.model("Upload", uploadSchema);

export default Upload;
