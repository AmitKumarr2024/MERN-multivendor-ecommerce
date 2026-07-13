import express from "express";
import {
  getRegistrationOptions,
  verifyRegistration,
  getLoginOptions,
  verifyLogin,
  listPasskeys,
  deletePasskey,
} from "./../controllers/webauthn.controller.js";
import { protect } from "../../../middleware/authMiddleware.js";
import { authLimiter } from "../../../middleware/rateLimiter.js";
import validate from "../../../middleware/validate.js";
import {
  registrationVerifySchema,
  loginOptionsSchema,
  loginVerifySchema,
} from "./../webauthn.validation.js";

const router = express.Router();

// Registration - adding a passkey to an already-logged-in (password-based) account
router.get("/register/options", protect, getRegistrationOptions);
router.post(
  "/register/verify",
  protect,
  validate(registrationVerifySchema),
  verifyRegistration,
);

// Login - public, not yet authenticated. Rate-limited like other auth entry points.
router.post(
  "/login/options",
  authLimiter,
  validate(loginOptionsSchema),
  getLoginOptions,
);
router.post(
  "/login/verify",
  authLimiter,
  validate(loginVerifySchema),
  verifyLogin,
);

// Manage registered devices
router.get("/", protect, listPasskeys);
router.delete("/:credentialId", protect, deletePasskey);

export default router;
