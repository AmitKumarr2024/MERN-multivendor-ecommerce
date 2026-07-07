import express from "express";
import { checkout } from "../controllers/order.create.controller.js";
import { getMyOrders, getOrderById, getShopOrders } from "../controllers/order.read.controller.js";
import { updateOrderStatus, cancelMyOrder } from "../controllers/order.update.controller.js";
import { protect, authorizeRoles } from "../../../middleware/authMiddleware.js";
import { ROLES } from "../../../constants/roles.js";

const router = express.Router();

// Every order route requires login
router.use(protect);

// Buyer
router.post("/checkout", checkout);
router.get("/me", getMyOrders);
router.patch("/:id/cancel", cancelMyOrder);

// Seller
router.get("/shop", authorizeRoles(ROLES.SELLER), getShopOrders);
router.patch("/:id/status", authorizeRoles(ROLES.SELLER), updateOrderStatus);

// Shared (buyer, owning seller, or admin - checked inside the controller)
router.get("/:id", getOrderById);

export default router;