import {
  uploadImageBuffer,
  uploadMultipleImageBuffers,
  deleteImageIfOwner,
} from "../../../services/upload.service.js";
import { BadRequestError } from "../../../exceptions/ApiError.js";

/**
 * UPLOAD CONTROLLER
 * ------------------------------------------------------------------
 *   1. uploadShopLogo     -> POST   /api/upload/shop-logo       (field: "image")
 *   2. uploadShopBanner   -> POST   /api/upload/shop-banner     (field: "image")
 *   3. uploadAvatar       -> POST   /api/upload/avatar          (field: "image")
 *   4. uploadProductImages -> POST   /api/upload/product-images  (field: "images", up to 5)
 *   5. removeImage        -> DELETE /api/upload/image
 *
 * Each endpoint hardcodes its own Cloudinary folder server-side - the
 * client never gets to choose the folder (earlier version accepted a
 * `?folder=` query param, which let any caller write into any folder).
 * This keeps storage organized and prevents that abuse.
 *
 * Frontend flow: upload here first, get back a URL, then include that URL
 * in the normal JSON body when creating/updating a shop or product. The
 * shop/product endpoints themselves stay plain JSON - only these upload
 * routes deal with multipart/form-data.
 * ------------------------------------------------------------------
 */

// Factory for the single-image endpoints (logo/banner/avatar) - identical
// shape, only the target folder differs.
const handleSingleUpload = (folder) => async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError(
        "No image file provided (expected field name 'image')",
      );
    }
    const result = await uploadImageBuffer(
      req.file.buffer,
      folder,
      req.user._id,
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// 1. Shop logo - square crop, auto-focused
export const uploadShopLogo = handleSingleUpload("shop-logos");

// 2. Shop banner - wide crop
export const uploadShopBanner = handleSingleUpload("shop-banners");

// 3. User avatar - square crop, face-focused
export const uploadAvatar = handleSingleUpload("avatars");

// 4. Product gallery - up to 5 images, no forced aspect ratio (just capped max size)
export const uploadProductImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new BadRequestError(
        "No image files provided (expected field name 'images')",
      );
    }
    const results = await uploadMultipleImageBuffers(
      req.files,
      "product-images",
      req.user._id,
    );
    res.status(201).json(results);
  } catch (error) {
    next(error);
  }
};

// 5. Delete an uploaded image - only the uploader or an admin can do this
export const removeImage = async (req, res, next) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      throw new BadRequestError("publicId is required");
    }

    await deleteImageIfOwner(publicId, req.user);
    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    next(error);
  }
};
