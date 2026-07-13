import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateMe,
  changePassword,
  updateMyRole,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import passkeyRoutes from "../../webAuthn/routes/webauthn.routes.js";
import { protect } from "../../../middleware/authMiddleware.js";
import { authLimiter } from "../../../middleware/rateLimiter.js";
import validate from "../../../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  updateMeSchema,
  changePasswordSchema,
  updateRoleSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./../auth.validation.js";

const router = express.Router();

// Public - authLimiter guards against brute-force/credential-stuffing
router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);
router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  forgotPassword,
);
router.post(
  "/reset-password",
  authLimiter,
  validate(resetPasswordSchema),
  resetPassword,
);

// Private
router.post("/logout", protect, logoutUser);
router.get("/me", protect, getMe);
router.put("/me", protect, validate(updateMeSchema), updateMe);
router.put(
  "/change-password",
  protect,
  authLimiter,
  validate(changePasswordSchema),
  changePassword,
);
router.put("/role", protect, validate(updateRoleSchema), updateMyRole);

// Passkey (WebAuthn) - all endpoints live under /api/auth/passkey/*
router.use("/passkey", passkeyRoutes);

export default router;
