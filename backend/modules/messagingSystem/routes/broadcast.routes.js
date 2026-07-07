import express from "express";
import {
  createShopBroadcast,
  createPlatformBroadcast,
  getShopBroadcasts,
  getPlatformBroadcasts,
  deactivateBroadcast,
} from "../controllers/broadcast.controller.js";
import { protect, authorizeRoles } from "../../../middleware/authMiddleware.js";
import { ROLES } from "../../../constants/roles.js";

const router = express.Router();

// Public - visitors fetch these without logging in
router.get("/shop/:slug", getShopBroadcasts);
router.get("/platform", getPlatformBroadcasts);

// Private - creating/managing broadcasts requires login + correct role
router.post("/shop", protect, authorizeRoles(ROLES.SELLER), createShopBroadcast);
router.post("/platform", protect, authorizeRoles(ROLES.ADMIN), createPlatformBroadcast);
router.patch("/:id/deactivate", protect, deactivateBroadcast); // role checked inside controller (seller-own-shop OR admin)

export default router;