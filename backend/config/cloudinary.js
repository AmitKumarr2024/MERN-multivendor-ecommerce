import { v2 as cloudinary } from "cloudinary";
import logger from "../logs/logger.js";

import dotenv from "dotenv";

dotenv.config({ path: "./.env" });



const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  // Don't crash the whole server over this - other features should keep
  // working - but make it loud so a missing .env value doesn't show up
  // as a confusing generic 500 the first time someone tries to upload.
  logger.warn(
    "Cloudinary credentials are missing from .env (CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET). Image upload endpoints will fail until these are set.",
  );
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export default cloudinary;
