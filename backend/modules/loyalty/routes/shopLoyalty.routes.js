import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import validate from "../../../middleware/validate.js";
import * as c from "../controllers/loyalty.controller.js";
import {
  shopParams,
  shopBuyerParams,
  shopRedemptionParams,
  programSchema,
  adjustSchema,
  pageQuerySchema,
  topQuerySchema,
} from "../loyalty.validation.js";

const router = express.Router({ mergeParams: true });

// Public - specific paths first
router.get(
  "/program/public",
  validate(shopParams, "params"),
  c.getPublicProgram,
);

router.use(protect); // ownership (or admin) is enforced inside the service

router.get("/program", validate(shopParams, "params"), c.getProgram);
router.put(
  "/program",
  validate(shopParams, "params"),
  validate(programSchema),
  c.saveProgram,
);
router.get(
  "/customers/top",
  validate(shopParams, "params"),
  validate(topQuerySchema, "query"),
  c.topCustomers,
);
router.get(
  "/customers",
  validate(shopParams, "params"),
  validate(pageQuerySchema, "query"),
  c.listCustomers,
);
router.get(
  "/customers/:buyerId/transactions",
  validate(shopBuyerParams, "params"),
  validate(pageQuerySchema, "query"),
  c.customerTransactions,
);
router.post(
  "/customers/:buyerId/adjust",
  validate(shopBuyerParams, "params"),
  validate(adjustSchema),
  c.adjust,
);
router.get(
  "/redemptions",
  validate(shopParams, "params"),
  validate(pageQuerySchema, "query"),
  c.listRedemptions,
);
router.patch(
  "/redemptions/:id/fulfill",
  validate(shopRedemptionParams, "params"),
  c.fulfill,
);

export default router;
