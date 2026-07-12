import express from "express";
import {
  uploadSingleImage,
  uploadImages,
  removeImage,
} from "../controller/upload.controller.js";
import { protect } from "../../../middleware/authMiddleware.js";
import upload from "../../../middleware/upload.js";

const router = express.Router();

// All upload routes require login - anonymous users shouldn't be able to
// fill up Cloudinary storage
router.use(protect);

router.post("/image", upload.single("image"), uploadSingleImage);
router.post("/images", upload.array("images", 5), uploadImages);
router.delete("/image", removeImage);

export default router;
