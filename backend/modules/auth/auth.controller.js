import User from "./auth.model.js";
import generateToken from "../../utils/generateToken.js";
import { ROLES } from "../../constants/roles.js";
import {
  BadRequestError,
  UnauthorizedError,
} from "../../exceptions/ApiError.js";
import { COOKIE_NAME, getCookieOptions } from "../../utils/cookieOptions.js";

// @desc    Register new user (buyer or seller)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      throw new BadRequestError("Name, email and password are required");
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
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

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
      role: user.role,
      shop: user.shop,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.json(req.user);
};

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

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

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

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      throw new BadRequestError("User not found");
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

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
