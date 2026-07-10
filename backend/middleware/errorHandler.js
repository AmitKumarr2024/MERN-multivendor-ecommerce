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

  // Unexpected errors (bugs, DB failures, etc.) - log at "error" with full stack
  logger.error(`${req.method} ${req.originalUrl} -> 500 ${err.message}`, {
    stack: err.stack,
  });
  res.status(500).json({ message: "Something went wrong", error: err.message });
};

export default errorHandler;
