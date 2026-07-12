import express from "express";
import {
  uploadShopLogo,
  uploadShopBanner,
  uploadAvatar,
  uploadProductImages,
  removeImage,
} from "../controller/upload.controller.js";
import { protect } from "../../../middleware/authMiddleware.js";
import { uploadLimiter } from "../../../middleware/rateLimiter.js";
import upload from "../../../middleware/upload.js";

const router = express.Router();

// All upload routes require login - anonymous users shouldn't be able to
// fill up Cloudinary storage
router.use(protect, uploadLimiter);

// Each route hardcodes its target folder server-side (see controller) -
// there is no client-controlled folder parameter anywhere here.
router.post("/shop-logo", upload.single("image"), uploadShopLogo);
router.post("/shop-banner", upload.single("image"), uploadShopBanner);
router.post("/avatar", upload.single("image"), uploadAvatar);
router.post("/product-images", upload.array("images", 5), uploadProductImages);
router.delete("/image", removeImage);

export default router;
