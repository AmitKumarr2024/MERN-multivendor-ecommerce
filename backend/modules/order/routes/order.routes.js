import express from "express";
import { checkout } from "../controllers/order.create.controller.js";
import {
  getMyOrders,
  getOrderById,
  getShopOrders,
} from "../controllers/order.read.controller.js";
import {
  updateOrderStatus,
  cancelMyOrder,
} from "../controllers/order.update.controller.js";
import { protect } from "../../../middleware/authMiddleware.js";
import validate from "../../../middleware/validate.js";
import {
  checkoutSchema,
  updateStatusSchema,
  cancelOrderSchema,
} from "../order.validation.js";

const router = express.Router();

// Every order route requires login
router.use(protect);

// Buyer
router.post("/checkout", validate(checkoutSchema), checkout);
router.get("/me", getMyOrders);
router.patch("/:id/cancel", validate(cancelOrderSchema), cancelMyOrder);

// Seller - ownership check inside each controller (Shop.findOne({owner})) is
// the real gatekeeper, same reasoning as product routes.
router.get("/shop", getShopOrders);
router.patch("/:id/status", validate(updateStatusSchema), updateOrderStatus);

// Shared (buyer, owning seller, or admin - checked inside the controller)
router.get("/:id", getOrderById);

export default router;
    