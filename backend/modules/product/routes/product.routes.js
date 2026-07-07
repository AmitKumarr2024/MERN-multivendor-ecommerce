import express from "express";
import { createProduct } from "../controllers/product.create.controller.js";
import {
  getAllProducts,
  getProductById,
  getProductsByShopSlug,
  getMyProducts,
} from "../controllers/product.read.controller.js";
import {
  updateProduct,
  updateProductStock,
  toggleProductActive,
} from "../controllers/product.update.controller.js";
import { deleteProduct } from "../controllers/product.delete.controller.js";
import { protect, authorizeRoles } from "../../../middleware/authMiddleware.js";
import { ROLES } from "../../../constants/roles.js";

const router = express.Router();

// Public - homepage feed (all shops' products)
router.get("/", getAllProducts);

// Private - seller's own products (dashboard) - must come before '/:id'
router.get("/me", protect, authorizeRoles(ROLES.SELLER), getMyProducts);

// Public - products of one specific dukan
router.get("/shop/:slug", getProductsByShopSlug);

// Public - single product detail
router.get("/:id", getProductById);

// Private - seller only
router.post("/", protect, authorizeRoles(ROLES.SELLER), createProduct);
router.put("/:id", protect, authorizeRoles(ROLES.SELLER), updateProduct);
router.patch("/:id/stock", protect, authorizeRoles(ROLES.SELLER), updateProductStock);
router.patch("/:id/toggle-active", protect, authorizeRoles(ROLES.SELLER), toggleProductActive);
router.delete("/:id", protect, authorizeRoles(ROLES.SELLER), deleteProduct);

export default router;