import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserBan,
  adminResetPassword,
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
import {
  getAllReviewsAdmin,
  forceDeleteReview,
} from "../controllers/admin.review.controller.js"; // 👈 NEW
import { protect, authorizeRoles } from "../../../middleware/authMiddleware.js";
import { ROLES } from "../../../constants/roles.js";

const router = express.Router();

router.use(protect, authorizeRoles(ROLES.ADMIN));

router.get("/dashboard", getDashboardStats);

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/role", updateUserRole);
router.patch("/users/:id/ban", toggleUserBan);
router.patch("/users/:id/reset-password", adminResetPassword);

router.get("/shops", getAllShopsAdmin);
router.patch("/shops/:id/verify", verifyShop);
router.patch("/shops/:id/toggle-active", forceToggleShop);

router.get("/products", getAllProductsAdmin);
router.patch("/products/:id/toggle-active", forceToggleProduct);
router.delete("/products/:id", forceDeleteProduct);

router.get("/orders", getAllOrdersAdmin);
router.delete("/orders/:id", forceDeleteOrder);

// 👇 NEW - Reviews
router.get("/reviews", getAllReviewsAdmin);
router.delete("/reviews/:id", forceDeleteReview);

export default router;
