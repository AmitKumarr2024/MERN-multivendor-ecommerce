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
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();

// Public - homepage feed (all shops' products)
router.get("/", getAllProducts);

// Private - seller's own products (dashboard) - must come before '/:id'
router.get("/me", protect, getMyProducts);

// Public - products of one specific dukan
router.get("/shop/:slug", getProductsByShopSlug);

// Public - single product detail
router.get("/:id", getProductById);

// Private - ownership check inside each controller (Shop.findOne({owner})) is
// the real gatekeeper here. No role check needed: "seller" role is only ever
// granted when a shop is created, so a user without a shop can never own a
// product anyway. Removing the role gate lets a buyer who tries this before
// creating a shop see the helpful "create your shop first" message instead
// of a generic 403.
router.post("/", protect, createProduct);
router.put("/:id", protect, updateProduct);
router.patch("/:id/stock", protect, updateProductStock);
router.patch("/:id/toggle-active", protect, toggleProductActive);
router.delete("/:id", protect, deleteProduct);

export default router;
