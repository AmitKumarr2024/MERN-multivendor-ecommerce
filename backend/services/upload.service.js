import cloudinary from "../config/cloudinary.js";
import { BadRequestError } from "../exceptions/ApiError.js";

/**
 * UPLOAD SERVICE
 * ------------------------------------------------------------------
 * Wraps Cloudinary's upload/delete calls in promise-based functions the
 * controller can await. Uses upload_stream so the in-memory file buffer
 * (from multer's memoryStorage) never touches disk anywhere in the flow.
 * ------------------------------------------------------------------
 */

// Uploads a single file buffer to a given Cloudinary folder.
// Returns { url, publicId } - publicId is needed later if the image is
// ever replaced/deleted (e.g. seller uploads a new shop logo).
export const uploadImageBuffer = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `ecommerce/${folder}`,
        resource_type: "image",
        // Automatically shrink absurdly large uploads and cap quality -
        // keeps storage/bandwidth costs sane without visible quality loss
        transformation: [
          { width: 1600, height: 1600, crop: "limit" },
          { quality: "auto:good" },
        ],
      },
      (error, result) => {
        if (error)
          return reject(
            new BadRequestError(`Image upload failed: ${error.message}`),
          );
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
};

// Uploads multiple files in parallel, returns an array of { url, publicId }
export const uploadMultipleImageBuffers = async (files, folder) => {
  return Promise.all(
    files.map((file) => uploadImageBuffer(file.buffer, folder)),
  );
};

// Deletes an image from Cloudinary by its publicId - used when a seller
// replaces a shop logo/banner or removes a product image, so orphaned
// files don't pile up in storage.
export const deleteImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Non-fatal - if Cloudinary deletion fails (e.g. already gone), don't
    // block the user's request over storage cleanup
  }
};
