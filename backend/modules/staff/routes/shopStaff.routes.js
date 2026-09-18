import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import validate from "../../../middleware/validate.js";
import upload from "../../../middleware/upload.js";
import { createStaffSchema } from "../staff.validation.js";
import {
  createStaff,
  listStaffForOwner,
  listPublicStaff,
} from "../controllers/staff.controller.js";

const router = express.Router({ mergeParams: true });

// Specific-before-generic isn't an issue here (no /:id catch-all in this
// router), but keep /public first anyway for readability/consistency with
// the project's documented route-order discipline.
router.get("/public", listPublicStaff); // no auth — public shop page

router.get("/", protect, listStaffForOwner); // seller: full roster
router.post(
  "/",
  protect,
  upload.single("profilePhoto"),
  validate(createStaffSchema),
  createStaff,
);

export default router;
