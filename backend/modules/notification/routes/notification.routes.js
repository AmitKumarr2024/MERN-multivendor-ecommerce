import express from "express";
import {
  getMyNotifications,
  getMyUnreadCount,
  markOneAsRead,
  markAllRead,
  removeNotification,
} from "../controllers/notification.controller.js";
import { protect } from "../../../middleware/authMiddleware.js";
import { apiLimiter } from "../../../middleware/rateLimiter.js";

const router = express.Router();

// Every notification route requires login — notifications are always
// scoped to req.user._id, never trusted from a param.
router.use(protect, apiLimiter);

router.get("/", getMyNotifications);
router.get("/unread-count", getMyUnreadCount);
router.patch("/mark-all-read", markAllRead);
router.patch("/:id/read", markOneAsRead);
router.delete("/:id", removeNotification);

export default router;
