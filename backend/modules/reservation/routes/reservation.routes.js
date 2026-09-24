import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import validate from "../../../middleware/validate.js";
import * as ctrl from "../controllers/reservation.controller.js";
import {
  createReservationSchema,
  rejectReservationSchema,
  cancelReservationSchema,
  listReservationsQuerySchema,
} from "../reservation.validation.js";

const router = express.Router();
router.use(protect);

router.get(
  "/my",
  validate(listReservationsQuerySchema, "query"),
  ctrl.getMyReservations,
);
router.post("/", validate(createReservationSchema), ctrl.createReservation);

router.get("/:id", ctrl.getReservationById);
router.patch(
  "/:id/cancel",
  validate(cancelReservationSchema),
  ctrl.cancelReservation,
);
router.patch("/:id/confirm", ctrl.confirmReservation);
router.patch(
  "/:id/reject",
  validate(rejectReservationSchema),
  ctrl.rejectReservation,
);
router.patch("/:id/ready", ctrl.markReady);
router.patch("/:id/collected", ctrl.markCollected);

export default router;
