import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import  validate  from "../../../middleware/validate.js";
import  upload  from "../../../middleware/upload.js";
import {
  updateStaffSchema,
  staffStatusSchema,
  markAttendanceSchema,
  monthlyAttendanceQuerySchema,
  staffFeedbackSchema,
} from "../staff.validation.js";
import {
  updateStaff,
  setStaffStatus,
  removeStaff,
  getStaffForOwner,
  getPublicStaffProfile,
  getStaffPerformance,
} from "../controllers/staff.controller.js";
import {
  markAttendance,
  getMonthlyAttendance,
} from "../controllers/attendance.controller.js";
import {
  checkFeedbackEligibility,
  createStaffFeedback,
  listStaffFeedback,
} from "../controllers/feedback.controller.js";

const router = express.Router();

// --- Route-order discipline (per project convention #12): every specific
// sub-path under /:id must be declared before the generic /:id catch-all. ---

router.get("/:id/public", getPublicStaffProfile); // public profile
router.get("/:id/feedback", listStaffFeedback); // public feedback list
router.get("/:id/feedback/eligibility", protect, checkFeedbackEligibility);
router.post(
  "/:id/feedback",
  protect,
  validate(staffFeedbackSchema),
  createStaffFeedback,
);

router.get(
  "/:id/attendance",
  protect,
  validate(monthlyAttendanceQuerySchema, "query"),
  getMonthlyAttendance,
);
router.post(
  "/:id/attendance",
  protect,
  validate(markAttendanceSchema),
  markAttendance,
);

router.get("/:id/performance", protect, getStaffPerformance);

router.patch(
  "/:id/status",
  protect,
  validate(staffStatusSchema),
  setStaffStatus,
);

// Generic catch-all — must stay LAST in this file.
router.get("/:id", protect, getStaffForOwner);
router.put(
  "/:id",
  protect,
  upload.single("profilePhoto"),
  validate(updateStaffSchema),
  updateStaff,
);
router.delete("/:id", protect, removeStaff);

export default router;
