import express from "express";
import {
  editMyReview,
  removeReview,
  sellerReply,
  voteHelpful,
} from "../controllers/review.controller.js";
import { protect } from "../../../middleware/authMiddleware.js";
import { apiLimiter } from "../../../middleware/rateLimiter.js";

const router = express.Router();

router.use(protect, apiLimiter);

router.put("/:id", editMyReview);
router.delete("/:id", removeReview);
router.post("/:id/reply", sellerReply);
router.patch("/:id/helpful", voteHelpful);

export default router;
