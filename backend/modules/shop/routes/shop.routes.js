import express from "express";
import { createShop } from "../controllers/create/shop.create.controller.js";
import { getAllShops, getShopBySlug, getMyShop } from "../controllers/read/shop.read.controller.js";
import { updateMyShop, toggleShopActive } from "../controllers/update/shop.update.controller.js";
import { checkSlugAvailability, updateShopSlug } from "../controllers/slug/shop.slug.controller.js";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();

// Public - directory listing
router.get("/", getAllShops);

// Public - check custom URL availability before submitting (must come before '/:slug')
router.get("/slug-check/:slug", checkSlugAvailability);

// Private - seller's own shop (must come before '/:slug')
router.get("/me", protect, getMyShop);
router.put("/me", protect, updateMyShop);
router.put("/me/slug", protect, updateShopSlug);
router.patch("/me/toggle-active", protect, toggleShopActive);

// Private - create shop
router.post("/", protect, createShop);

// Public - dukan page by custom URL slug (must be last, catches any remaining slug)
router.get("/:slug", getShopBySlug);

export default router;