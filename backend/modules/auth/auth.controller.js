import User from "./auth.model.js";
import generateToken from "../../utils/generateToken.js";
import { ROLES } from "../../constants/roles.js";
import {
  BadRequestError,
  UnauthorizedError,
} from "../../exceptions/ApiError.js";
import { COOKIE_NAME, getCookieOptions } from "../../utils/cookieOptions.js";

/**
 * AUTH CONTROLLER
 * ------------------------------------------------------------------
 *   1. registerUser   -> POST /api/auth/register
 *   2. loginUser       -> POST /api/auth/login
 *   3. logoutUser      -> POST /api/auth/logout
 *   4. getMe            -> GET  /api/auth/me
 *   5. updateMe         -> PUT  /api/auth/me
 *   6. changePassword   -> PUT  /api/auth/change-password
 *   7. updateMyRole     -> PUT  /api/auth/role
 * ------------------------------------------------------------------
 */

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
// @desc    Update logged-in user's profile (name, phone)
// @route   PUT /api/auth/me
// @access  Private
export const updateMe = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

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

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
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
