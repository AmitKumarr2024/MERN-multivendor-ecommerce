import express from "express";
import {
  getMyWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlisted,
  clearWishlist,
} from "../controllers/wishlist.controller.js";
import { protect } from "../../../middleware/authMiddleware.js";
import validate from "../../../middleware/validate.js";
import { addItemSchema } from "../wishlist.validation.js";

const router = express.Router();

// All wishlist routes require login - a wishlist belongs to a logged-in user
router.use(protect);

router.get("/", getMyWishlist);
router.post("/items", validate(addItemSchema), addToWishlist);
router.delete("/items/:productId", removeFromWishlist);
router.get("/check/:productId", checkWishlisted);
router.delete("/", clearWishlist);

export default router;
