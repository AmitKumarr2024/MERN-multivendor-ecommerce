import multer from "multer";
import { ApiError } from "../exceptions/ApiError.js";
import logger from "../logs/logger.js";

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Known, expected errors (validation, not-found, auth) - log at "warn",
  // they're not bugs, just normal request-flow outcomes
  if (err instanceof ApiError) {
    logger.warn(
      `${req.method} ${req.originalUrl} -> ${err.statusCode} ${err.message}`,
    );
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Multer generates its own error class for things like file-too-large or
  // an unexpected field name - map these to a clean 400 instead of a 500
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large. Maximum size is 5MB."
        : `Upload error: ${err.message}`;
    logger.warn(`${req.method} ${req.originalUrl} -> 400 ${message}`);
    return res.status(400).json({ message });
  }

  // Unexpected errors (bugs, DB failures, etc.) - log at "error" with full stack
  logger.error(`${req.method} ${req.originalUrl} -> 500 ${err.message}`, {
    stack: err.stack,
  });
  res.status(500).json({ message: "Something went wrong", error: err.message });
};

export default errorHandler;
