import express from "express";

import { getMe, loginUser, logoutUser, registerUser } from "./auth.controller.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser);

// Private routes
router.get("/me", protect, getMe);


export default router;
