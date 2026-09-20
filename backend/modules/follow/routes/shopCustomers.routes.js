import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import validate from "../../../middleware/validate.js";
import { customersQuerySchema } from "../follow.validation.js";
import { listShopCustomers } from "../controllers/follow.controller.js";

const router = express.Router({ mergeParams: true });

// Seller-only: ownership check happens in customerStats.service.js
router.get(
  "/",
  protect,
  validate(customersQuerySchema, "query"),
  listShopCustomers,
);

export default router;
