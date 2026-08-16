import User from "../models/auth.model.js";
import crypto from "crypto";

import generateToken from "../../../utils/generateToken.js";
import { ROLES } from "../../../constants/roles.js";
import {
  BadRequestError,
  UnauthorizedError,
} from "../../../exceptions/ApiError.js";
import { COOKIE_NAME, getCookieOptions } from "../../../utils/cookieOptions.js";

/**
 * AUTH CONTROLLER
 * ------------------------------------------------------------------
 *   1. registerUser     -> POST /api/auth/register
 *   2. loginUser         -> POST /api/auth/login
 *   3. logoutUser        -> POST /api/auth/logout
 *   4. getMe              -> GET  /api/auth/me
 *   5. updateMe           -> PUT  /api/auth/me
 *   6. changePassword     -> PUT  /api/auth/change-password
 *   7. updateMyRole       -> PUT  /api/auth/role
 *   8. forgotPassword     -> POST /api/auth/forgot-password
 *   9. resetPassword      -> POST /api/auth/reset-password
 * ------------------------------------------------------------------
 */

const RESET_TOKEN_EXPIRES_MINUTES = 15;

// Hashes a raw reset token the same way every time, so what's stored in the
// DB can be compared against a re-hash of whatever the user submits later.
// Reset tokens are high-entropy random strings (not human-chosen secrets
// like passwords), so a fast hash (sha256) is the standard/appropriate
// choice here - unlike passwords, there's no point paying bcrypt's
// deliberately-slow cost for something with this much entropy.
const hashToken = (rawToken) =>
  crypto.createHash("sha256").update(rawToken).digest("hex");

// 1. ----------------------------------------------------------------
// @desc    Register new user (buyer or seller)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      throw new BadRequestError("Name, email and password are required");
    }
    if (password.length < 6) {
      throw new BadRequestError("Password must be at least 6 characters");
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      throw new BadRequestError("User with this email already exists");
    }

    // Only allow 'buyer' or 'seller' at registration; 'admin' set manually in DB
    const allowedRole = [ROLES.BUYER, ROLES.SELLER].includes(role)
      ? role
      : ROLES.BUYER;

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: allowedRole,
    });

    const token = generateToken(user._id, user.role);
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      address: user.address,
      role: user.role,
      shop: user.shop,
    });
  } catch (error) {
    next(error);
  }
};

// 2. ----------------------------------------------------------------
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedError(
        "Your account has been suspended. Please contact support.",
      );
    }

    const token = generateToken(user._id, user.role);
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      address: user.address,
      role: user.role,
      shop: user.shop,
      mustChangePassword: user.mustChangePassword,
    });
  } catch (error) {
    next(error);
  }
};

// 3. ----------------------------------------------------------------
// @desc    Logout user - clears the auth cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res) => {
  // clearCookie options (except maxAge) must match how the cookie was set,
  // otherwise some browsers won't remove it
  const { maxAge, ...cookieOptions } = getCookieOptions();

  res.clearCookie(COOKIE_NAME, cookieOptions);

  res.json({ message: "Logged out successfully" });
};

// 4. ----------------------------------------------------------------
// @desc    Get logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.json(req.user);
};

// 5. ----------------------------------------------------------------
// @desc    Update logged-in user's profile (name, phone, avatar, address)
// @route   PUT /api/auth/me
// @access  Private
export const updateMe = async (req, res, next) => {
  try {
    const { name, phone, avatar, address } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new BadRequestError("User not found");
    }

    if (name !== undefined) {
      if (!name.trim()) {
        throw new BadRequestError("Name cannot be empty");
      }
      user.name = name.trim();
    }
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (address !== undefined) {
      // Merge rather than replace, so a partial update (e.g. only city
      // changed) doesn't wipe out the other address fields.
      user.address = {
        ...(user.address?.toObject?.() ?? user.address ?? {}),
        ...address,
      };
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      address: user.address,
      role: user.role,
      shop: user.shop,
    });
  } catch (error) {
    next(error);
  }
};

// 6. ----------------------------------------------------------------
// @desc    Change password (requires current password)
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new BadRequestError(
        "Current password and new password are required",
      );
    }
    if (newPassword.length < 6) {
      throw new BadRequestError("New password must be at least 6 characters");
    }
    if (currentPassword === newPassword) {
      throw new BadRequestError(
        "New password must be different from the current password",
      );
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      throw new BadRequestError("User not found");
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    user.password = newPassword; // pre-save hook will hash it
    user.mustChangePassword = false; // clears any pending admin-reset flag
    await user.save();

    // Issue a fresh token/cookie too - good practice after a credential change,
    // in case the person wants to invalidate any other stale sessions later.
    const token = generateToken(user._id, user.role);
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

// 7. ----------------------------------------------------------------
// @desc    Switch own role between buyer and seller (admin role is never self-assignable here)
// @route   PUT /api/auth/role
// @access  Private
export const updateMyRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (![ROLES.BUYER, ROLES.SELLER].includes(role)) {
      throw new BadRequestError("Role must be either 'buyer' or 'seller'");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new BadRequestError("User not found");
    }

    if (role === user.role) {
      return res.json({ message: "Role unchanged", role: user.role });
    }

    // A user only becomes a seller through creating a shop (see shop.create.controller.js,
    // which sets role to seller automatically). Block manually switching to seller
    // without one, so "seller" always implies "has a shop".
    if (role === ROLES.SELLER && !user.shop) {
      throw new BadRequestError(
        "Create a shop first - your role will switch to seller automatically",
      );
    }

    user.role = role;
    await user.save();

    // Role is embedded in the JWT payload, so a role change requires a fresh token,
    // otherwise authorizeRoles() checks would keep using the stale role until the old token expires.
    const token = generateToken(user._id, user.role);
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    res.json({ message: "Role updated successfully", role: user.role });
  } catch (error) {
    next(error);
  }
};

// 8. ----------------------------------------------------------------
// @desc    Request a password reset token for an email
// @route   POST /api/auth/forgot-password
// @access  Public
//
// SECURITY NOTE: this responds identically whether or not the email exists,
// to prevent an attacker from using this endpoint to discover which emails
// are registered ("user enumeration"). The actual reset token is NEVER
// included in the response in production - it must be delivered out-of-band
// (email) so only the real account owner ever sees it. Wire up a real email
// service (Nodemailer/Resend/SendGrid) at the marked TODO before going live;
// until then this only works via the dev-mode token echoed back below.
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new BadRequestError("Email is required");
    }

    const genericResponse = {
      message:
        "If an account with that email exists, a password reset link has been sent.",
    };

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json(genericResponse); // same response either way - don't leak existence
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = hashToken(rawToken);
    user.resetPasswordExpires = new Date(
      Date.now() + RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000,
    );
    await user.save();

    // TODO: replace this block with a real email call, e.g.:
    //   await sendPasswordResetEmail(user.email, rawToken);
    // and remove the token from the JSON response entirely once that's wired in.
    if (process.env.NODE_ENV !== "production") {
      return res.json({
        ...genericResponse,
        devOnlyResetToken: rawToken,
        devOnlyNote:
          "This token is only returned here because no email service is configured yet. Never expose this in production.",
      });
    }

    res.json(genericResponse);
  } catch (error) {
    next(error);
  }
};

// 9. ----------------------------------------------------------------
// @desc    Reset password using a token from forgotPassword
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new BadRequestError("Token and new password are required");
    }
    if (newPassword.length < 6) {
      throw new BadRequestError("New password must be at least 6 characters");
    }

    const hashedToken = hashToken(token);
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      throw new BadRequestError("Invalid or expired reset token");
    }

    user.password = newPassword; // pre-save hook hashes it
    user.mustChangePassword = false;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Log them straight in after a successful reset - nicer UX than making
    // them go reset -> then separately log in with the brand new password.
    const authToken = generateToken(user._id, user.role);
    res.cookie(COOKIE_NAME, authToken, getCookieOptions());

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};
