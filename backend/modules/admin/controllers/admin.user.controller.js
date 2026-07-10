import crypto from "crypto";
import User from "../../auth/auth.model.js";
import { ROLES } from "../../../constants/roles.js";
import {
  BadRequestError,
  NotFoundError,
} from "../../../exceptions/ApiError.js";

/**
 * ADMIN - USER MANAGEMENT
 * ------------------------------------------------------------------
 *   1. getAllUsers        -> GET   /api/admin/users
 *   2. getUserById         -> GET   /api/admin/users/:id
 *   3. updateUserRole      -> PUT   /api/admin/users/:id/role
 *   4. toggleUserBan       -> PATCH /api/admin/users/:id/ban
 *   5. adminResetPassword  -> PATCH /api/admin/users/:id/reset-password
 * ------------------------------------------------------------------
 */

// 1. Get all users - supports filtering by role, search by name/email
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const safeLimit = Math.min(Number(limit) || 20, 100);

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * safeLimit)
      .limit(safeLimit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page: Number(page),
      pages: Math.ceil(total / safeLimit),
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get single user detail
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "shop",
      "shopName slug",
    );
    if (!user) {
      throw new NotFoundError("User not found");
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// 3. Change a user's role (e.g. promote to admin, demote a seller)
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!Object.values(ROLES).includes(role)) {
      throw new BadRequestError(
        `Role must be one of: ${Object.values(ROLES).join(", ")}`,
      );
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Prevent an admin from accidentally demoting themselves and losing access
    if (
      user._id.toString() === req.user._id.toString() &&
      role !== ROLES.ADMIN
    ) {
      throw new BadRequestError("You cannot change your own admin role");
    }

    user.role = role;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

// 4. Ban / unban a user (blocks login without deleting their data)
export const toggleUserBan = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user._id.toString() === req.user._id.toString()) {
      throw new BadRequestError("You cannot ban your own account");
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ _id: user._id, isActive: user.isActive });
  } catch (error) {
    next(error);
  }
};

// 5. Reset a user's password on their behalf - for the "I forgot my password and
//    messaged support" flow. Admin can either supply a specific new password, or
//    leave it out and the system generates a random temporary one (returned in
//    the response so the admin can relay it to the user, e.g. via the chat/
//    messaging module or email).
//
//    The affected user is flagged `mustChangePassword: true`, so once they log
//    in with this password, the frontend should force them straight to a
//    "set a new password" screen before letting them use the app - the
//    flag clears automatically once they change it themselves
//    (see changePassword in auth.controller.js).
export const adminResetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (newPassword && newPassword.length < 6) {
      throw new BadRequestError("New password must be at least 6 characters");
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Generate a random temporary password if the admin didn't provide one -
    // e.g. "a1b2c3d4e5f6" (12 hex chars, easy enough to read out/type once)
    const temporaryPassword =
      newPassword || crypto.randomBytes(6).toString("hex");

    user.password = temporaryPassword; // pre-save hook hashes it
    user.mustChangePassword = true;
    await user.save();

    res.json({
      message:
        "Password has been reset. Share this temporary password with the user securely.",
      userId: user._id,
      email: user.email,
      temporaryPassword,
    });
  } catch (error) {
    next(error);
  }
};
