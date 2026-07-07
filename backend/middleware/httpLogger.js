import morgan from "morgan";
import logger from "../config/logger.js";

// Pipes Morgan's HTTP access logs through Winston, so both request logs and
// application logs (errors, info) end up in the same files/console with
// consistent formatting.
const stream = {
  write: (message) => logger.http ? logger.http(message.trim()) : logger.info(message.trim()),
};

// "dev" format for readable console output during development;
// "combined" (Apache-style) is more detailed and better for production log analysis
const format = process.env.NODE_ENV === "production" ? "combined" : "dev";

const httpLogger = morgan(format, { stream });

export default httpLogger;