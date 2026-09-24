import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import validate from "../../../middleware/validate.js";
import * as ctrl from "../controllers/reservation.controller.js";
import {
  shopReservationSettingsSchema,
  listReservationsQuerySchema,
} from "../reservation.validation.js";

const router = express.Router({ mergeParams: true });

// Public - buyer checks eligibility + pickup instructions before reserving
router.get("/status", ctrl.getShopReservationStatus);

router.use(protect);

router.get(
  "/",
  validate(listReservationsQuerySchema, "query"),
  ctrl.getShopReservations,
);
router.patch(
  "/settings",
  validate(shopReservationSettingsSchema),
  ctrl.setShopReservationSettings,
);

export default router;
