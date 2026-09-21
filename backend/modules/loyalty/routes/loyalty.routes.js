import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import validate from "../../../middleware/validate.js";
import * as c from "../controllers/loyalty.controller.js";
import {
  shopParams,
  redeemSchema,
  pageQuerySchema,
} from "../loyalty.validation.js";

const router = express.Router();
router.use(protect);

router.get("/my", c.myAccounts);
router.get(
  "/my/redemptions",
  validate(pageQuerySchema, "query"),
  c.myRedemptions,
);
router.get("/shop/:shopId", validate(shopParams, "params"), c.shopLoyalty);
router.get(
  "/shop/:shopId/transactions",
  validate(shopParams, "params"),
  validate(pageQuerySchema, "query"),
  c.myTransactions,
);
router.post(
  "/shop/:shopId/redeem",
  validate(shopParams, "params"),
  validate(redeemSchema),
  c.redeem,
);

export default router;
