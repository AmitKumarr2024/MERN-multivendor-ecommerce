import express from "express";
import { getMyCart, addToCart, updateCartItem, removeCartItem, emptyCart } from "../controllers/cart.controller.js";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();

// All cart routes require login - a cart belongs to a logged-in user
router.use(protect);

router.get("/", getMyCart);
router.post("/items", addToCart);
router.put("/items/:productId", updateCartItem);
router.delete("/items/:productId", removeCartItem);
router.delete("/", emptyCart);

export default router;