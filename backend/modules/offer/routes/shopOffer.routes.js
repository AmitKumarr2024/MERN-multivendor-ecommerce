import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import validate from "../../../middleware/validate.js";
import {
  createOfferSchema,
  updateOfferSchema,
  validateCouponSchema,
} from "../offer.validation.js";
import {
  createOffer,
  updateOffer,
  deleteOffer,
  listShopOffers,
  getOffer,
  getPublicOffers,
} from "../controllers/offer.controller.js";
import { validateCoupon } from "../controllers/coupon.controller.js";

const router = express.Router({ mergeParams: true });

// Public — shown on the shop page, no login required. Must come before
// the generic /:id below (route-order discipline).
router.get("/public", getPublicOffers);

router.use(protect);

// Buyer — check a code against their current cart for this shop
router.post("/validate-coupon", validate(validateCouponSchema), validateCoupon);

// Seller (ownership enforced inside the service)
router.get("/", listShopOffers);
router.post("/", validate(createOfferSchema), createOffer);
router.get("/:id", getOffer);
router.put("/:id", validate(updateOfferSchema), updateOffer);
router.delete("/:id", deleteOffer);

export default router;
