import express from "express";
import validate from "../../../middleware/validate.js";
import { protect } from "../../../middleware/authMiddleware.js";
import * as ctrl from "../controllers/khata.controller.js";
import {
  approveKhataSchema,
  rejectKhataSchema,
  suspendKhataSchema,
  updateCreditLimitSchema,
  recordPaymentSchema,
  monthlyStatementQuerySchema,
  closeMonthSchema,
} from "../khata.validation.js";

const router = express.Router();
router.use(protect);

router.get("/my", ctrl.getMyKhatas); // buyer: all my khatas across shops

router.patch("/:id/approve", validate(approveKhataSchema), ctrl.approveKhata);
router.patch("/:id/reject", validate(rejectKhataSchema), ctrl.rejectKhata);
router.patch("/:id/suspend", validate(suspendKhataSchema), ctrl.suspendKhata);
router.patch("/:id/reactivate", ctrl.reactivateKhata);
router.patch(
  "/:id/credit-limit",
  validate(updateCreditLimitSchema),
  ctrl.updateCreditLimit,
);
router.post("/:id/payments", validate(recordPaymentSchema), ctrl.recordPayment);
router.get("/:id/transactions", ctrl.getTransactionHistory);
router.get(
  "/:id/statement",
  validate(monthlyStatementQuerySchema, "query"),
  ctrl.getMonthlyStatement,
);
router.post("/:id/close-month", validate(closeMonthSchema), ctrl.closeMonth);

export default router;
