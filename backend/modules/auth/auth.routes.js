import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateMe,
  changePassword,
  updateMyRole,
} from "./auth.controller.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);

// Private
router.post("/logout", protect, logoutUser);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.put("/change-password", protect, changePassword);
router.put("/role", protect, updateMyRole);

export default router;
