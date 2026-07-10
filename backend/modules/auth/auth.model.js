import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../../constants/roles.js";

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
    // Set to true when an admin resets this user's password on their behalf.
    // Frontend should check this on login and force the user to set a new
    // password before letting them use the app normally.
    mustChangePassword: {
      type: Boolean,
      default: false,
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
