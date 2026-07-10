import winston from "winston";
import path from "path";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const LOGS_DIR = path.resolve("logs");

// Human-readable format for console (development)
const consoleFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }), // ensures err.stack is printed, not just err.message
  printf(({ level, message, timestamp: ts, stack }) => {
    return `${ts} [${level}]: ${stack || message}`;
  })
);

// Structured JSON format for files (easier to parse/ingest later, e.g. by a log aggregator)
const fileFormat = combine(timestamp(), errors({ stack: true }), json());

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  transports: [
    new winston.transports.File({
      filename: path.join(LOGS_DIR, "error.log"),
      level: "error",
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: path.join(LOGS_DIR, "combined.log"),
      format: fileFormat,
    }),
  ],
  // Don't crash the process if logging itself throws
  exitOnError: false,
});

// Also log to console, except during tests (keeps test output clean)
if (process.env.NODE_ENV !== "test") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

export default logger;