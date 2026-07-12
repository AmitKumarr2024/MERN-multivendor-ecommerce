import cloudinary from "../config/cloudinary.js";
import Upload from "../modules/upload/models/upload.model.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../exceptions/ApiError.js";

/**
 * UPLOAD SERVICE
 * ------------------------------------------------------------------
 * Wraps Cloudinary's upload/delete calls in promise-based functions the
 * controller can await. Uses upload_stream so the in-memory file buffer
 * (from multer's memoryStorage) never touches disk anywhere in the flow.
 *
 * Every successful upload is also recorded in the Upload model, so later
 * a delete request can be checked against who actually uploaded it.
 * ------------------------------------------------------------------
 */

// Each folder gets image transformations appropriate to what it's for -
// applied by Cloudinary during upload, not after, so storage/bandwidth
// stays proportional to what's actually needed.
const FOLDER_TRANSFORMS = {
  "shop-logos": [
    { width: 500, height: 500, crop: "fill", gravity: "auto" },
    { quality: "auto:good" },
  ],
  "shop-banners": [
    { width: 1200, height: 400, crop: "fill", gravity: "auto" },
    { quality: "auto:good" },
  ],
  "product-images": [
    { width: 1200, height: 1200, crop: "limit" },
    { quality: "auto:good" },
  ],
  avatars: [
    { width: 300, height: 300, crop: "fill", gravity: "face" },
    { quality: "auto:good" },
  ],
  misc: [
    { width: 1600, height: 1600, crop: "limit" },
    { quality: "auto:good" },
  ],
};

const streamUpload = (buffer, folder) => {
  const transformation = FOLDER_TRANSFORMS[folder] || FOLDER_TRANSFORMS.misc;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `ecommerce/${folder}`,
        resource_type: "image",
        transformation,
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

// Uploads a single file buffer to a given Cloudinary folder, and records
// the upload against the uploading user for later ownership checks.
export const uploadImageBuffer = async (buffer, folder, uploadedBy) => {
  const result = await streamUpload(buffer, folder);
  await Upload.create({ ...result, folder, uploadedBy });
  return result;
};

// Uploads multiple files in parallel, returns an array of { url, publicId }
export const uploadMultipleImageBuffers = async (files, folder, uploadedBy) => {
  return Promise.all(
    files.map((file) => uploadImageBuffer(file.buffer, folder, uploadedBy)),
  );
};

// Deletes an image from Cloudinary AND its tracking record - but only if
// the requester actually uploaded it (or is an admin). This is the check
// that prevents any logged-in user from deleting someone else's images.
export const deleteImageIfOwner = async (publicId, requester) => {
  const record = await Upload.findOne({ publicId });
  if (!record) {
    throw new NotFoundError("No upload found with that publicId");
  }

  const isOwner = record.uploadedBy.toString() === requester._id.toString();
  if (!isOwner && requester.role !== "admin") {
    throw new ForbiddenError("You are not allowed to delete this image");
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // Non-fatal - if Cloudinary deletion fails (e.g. already gone there),
    // still clean up our own tracking record below rather than blocking
  }

  await record.deleteOne();
};
