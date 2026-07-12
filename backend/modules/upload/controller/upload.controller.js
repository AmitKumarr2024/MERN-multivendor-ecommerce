import {
  uploadImageBuffer,
  uploadMultipleImageBuffers,
  deleteImage,
} from "../../../services/upload.service.js";
import { BadRequestError } from "../../../exceptions/ApiError.js";

/**
 * UPLOAD CONTROLLER
 * ------------------------------------------------------------------
 *   1. uploadSingleImage -> POST   /api/upload/image     (field name: "image")
 *   2. uploadImages       -> POST   /api/upload/images    (field name: "images", up to 5)
 *   3. removeImage        -> DELETE /api/upload/image
 *
 * This is a generic, standalone upload endpoint - it doesn't know or care
 * whether the image is for a shop logo, banner, or product photo. The
 * frontend uploads first, gets back a URL, then includes that URL in the
 * normal JSON body when creating/updating a shop or product. This keeps
 * the existing shop/product endpoints as plain JSON (no multipart there),
 * so nothing about their request shape changes.
 * ------------------------------------------------------------------
 */

const ALLOWED_FOLDERS = [
  "shop-logos",
  "shop-banners",
  "product-images",
  "avatars",
];

const resolveFolder = (folder) =>
  ALLOWED_FOLDERS.includes(folder) ? folder : "misc";

// 1. Upload a single image (shop logo, banner, avatar, etc.)
// @route   POST /api/upload/image?folder=shop-logos
// @access  Private
export const uploadSingleImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError(
        "No image file provided (expected field name 'image')",
      );
    }

    const folder = resolveFolder(req.query.folder);
    const result = await uploadImageBuffer(req.file.buffer, folder);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// 2. Upload multiple images at once (product gallery)
// @route   POST /api/upload/images?folder=product-images
// @access  Private
export const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new BadRequestError(
        "No image files provided (expected field name 'images')",
      );
    }

    const folder = resolveFolder(req.query.folder);
    const results = await uploadMultipleImageBuffers(req.files, folder);

    res.status(201).json(results);
  } catch (error) {
    next(error);
  }
};

// 3. Delete an uploaded image (called when a seller removes/replaces an image)
// @route   DELETE /api/upload/image
// @access  Private
export const removeImage = async (req, res, next) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      throw new BadRequestError("publicId is required");
    }

    await deleteImage(publicId);
    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    next(error);
  }
};
