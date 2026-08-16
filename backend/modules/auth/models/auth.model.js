import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../../../constants/roles.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // Hide password by default
    },
    phone: {
      type: String,
      trim: true,
    },
    // Profile photo URL (Cloudinary) - uploaded via /api/upload/avatar,
    // same decoupled-upload pattern as Shop.logo/Shop.banner.
    avatar: {
      type: String,
      default: "",
    },
    // Buyer's personal shipping/contact address - separate from Shop.address,
    // which is the seller's business address. Kept as a single embedded
    // object (not an array) since multi-address support isn't built yet -
    // matches the "simple version first" philosophy used elsewhere in this
    // project. Extend to an array of addresses later if buyers need to save
    // more than one (home/work/parents' place etc).
    address: {
      street: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "" },
      state: { type: String, trim: true, default: "" },
      pincode: { type: String, trim: true, default: "" },
      country: { type: String, trim: true, default: "India" },
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.BUYER,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Set to true when an admin resets this user's password on their behalf,
    // or after a self-service forgot-password reset. Frontend should check
    // this on login and force a "set a new password" screen.
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    // Self-service "forgot password" flow - stores a HASHED token (never the
    // raw token, same principle as passwords) plus an expiry. Hidden from
    // default queries like password is.
    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
      select: false,
    },
    // Registered WebAuthn passkeys - a user can have multiple (phone,
    // laptop, security key, etc). Public key stored as a base64url string
    // (converted from the raw Uint8Array @simplewebauthn works with) since
    // MongoDB has no native typed-array field type.
    passkeys: [
      {
        _id: false,
        credentialId: { type: String, required: true }, // base64url, unique per credential
        publicKey: { type: String, required: true }, // base64url-encoded public key bytes
        counter: { type: Number, default: 0 }, // replay-attack detection - must only ever increase
        deviceType: { type: String }, // "singleDevice" | "multiDevice"
        backedUp: { type: Boolean, default: false },
        transports: [{ type: String }], // e.g. ["internal", "hybrid"]
        nickname: { type: String, default: "My device", trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // Short-lived challenge for whichever WebAuthn ceremony (registration or
    // authentication) is currently in progress. Cleared immediately after
    // use or expiry - never meant to persist beyond a single round-trip.
    currentChallenge: {
      type: String,
      default: null,
      select: false,
    },
    currentChallengeExpires: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function () {
  // Only hash the password if it has been modified or is new
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
