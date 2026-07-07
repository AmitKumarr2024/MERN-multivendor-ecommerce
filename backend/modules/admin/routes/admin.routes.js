import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserBan,
} from "../controllers/admin.user.controller.js";
import {
  getAllShopsAdmin,
  verifyShop,
  forceToggleShop,
} from "../controllers/admin.shop.controller.js";
import {
  getAllProductsAdmin,
  forceToggleProduct,
  forceDeleteProduct,
} from "../controllers/admin.product.controller.js";
import { getDashboardStats } from "../controllers/admin.dashboard.controller.js";
import {
  getAllOrdersAdmin,
  forceDeleteOrder,
} from "../controllers/admin.order.controller.js";
import { protect, authorizeRoles } from "../../../middleware/authMiddleware.js";
import { ROLES } from "../../../constants/roles.js";

const router = express.Router();

// Every route below requires: logged in AND role === admin
router.use(protect, authorizeRoles(ROLES.ADMIN));

// Dashboard
router.get("/dashboard", getDashboardStats);

// Users
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/role", updateUserRole);
router.patch("/users/:id/ban", toggleUserBan);

// Shops
router.get("/shops", getAllShopsAdmin);
router.patch("/shops/:id/verify", verifyShop);
router.patch("/shops/:id/toggle-active", forceToggleShop);

// Products
router.get("/products", getAllProductsAdmin);
router.patch("/products/:id/toggle-active", forceToggleProduct);
router.delete("/products/:id", forceDeleteProduct);

// Orders
router.get("/orders", getAllOrdersAdmin);
router.delete("/orders/:id", forceDeleteOrder);

export default router;
