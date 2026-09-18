import express from "express";
import { createProduct } from "../controllers/product.create.controller.js";
import {
  getAllProducts,
  getProductById,
  getProductsByShopSlug,
  getMyProducts,
  getRelatedProducts,
  searchProductsHandler,
  searchSuggestionsHandler,
  trendingSearchesHandler,
} from "../controllers/product.read.controller.js";
import {
  updateProduct,
  updateProductStock,
  toggleProductActive,
  addVariant,
  updateVariant,
  deleteVariant,
} from "../controllers/product.update.controller.js";
import { deleteProduct } from "../controllers/product.delete.controller.js";
import {
  writeReview,
  listProductReviews,
  getReviewEligibility,
} from "../../review/controllers/review.controller.js";
import { protect } from "../../../middleware/authMiddleware.js";
import validate from "../../../middleware/validate.js";
import {
  createProductSchema,
  updateProductSchema,
  updateStockSchema,
  addVariantSchema,
  updateVariantSchema,
} from "../product.validation.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/me", protect, getMyProducts);

router.get("/search", searchProductsHandler);
router.get("/search/suggestions", searchSuggestionsHandler);
router.get("/search/trending", trendingSearchesHandler);

router.get("/shop/:slug", getProductsByShopSlug);

router.get("/:productId/reviews", listProductReviews);
router.get("/:productId/reviews/eligibility", protect, getReviewEligibility);
router.post("/:productId/reviews", protect, writeReview);

router.get("/:id/related", getRelatedProducts);

router.get("/:id", getProductById);

router.post("/", protect, validate(createProductSchema), createProduct);
router.put("/:id", protect, validate(updateProductSchema), updateProduct);
router.patch(
  "/:id/stock",
  protect,
  validate(updateStockSchema),
  updateProductStock,
);
router.patch("/:id/toggle-active", protect, toggleProductActive);
router.delete("/:id", protect, deleteProduct);

router.post("/:id/variants", protect, validate(addVariantSchema), addVariant);
router.put(
  "/:id/variants/:variantId",
  protect,
  validate(updateVariantSchema),
  updateVariant,
);
router.delete("/:id/variants/:variantId", protect, deleteVariant);

export default router;
