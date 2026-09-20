import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import validate from "../../../middleware/validate.js";
import {
  shopIdParamSchema,
  followedShopsQuerySchema,
} from "../follow.validation.js";
import * as ctrl from "../controllers/follow.controller.js";

const router = express.Router();

// Public: aggregate counts only
router.get(
  "/shop/:shopId/stats",
  validate(shopIdParamSchema, "params"),
  ctrl.getShopPublicStats,
);

router.use(protect);

router.get(
  "/me",
  validate(followedShopsQuerySchema, "query"),
  ctrl.listMyFollowed,
);
router.get(
  "/shop/:shopId/status",
  validate(shopIdParamSchema, "params"),
  ctrl.getStatus,
);
router.post(
  "/shop/:shopId",
  validate(shopIdParamSchema, "params"),
  ctrl.follow,
);
router.delete(
  "/shop/:shopId",
  validate(shopIdParamSchema, "params"),
  ctrl.unfollow,
);

export default router;
