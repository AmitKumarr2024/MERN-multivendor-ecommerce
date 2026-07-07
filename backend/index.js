import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import logger from "./config/logger.js";
import httpLogger from "./middleware/httpLogger.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./modules/auth/auth.routes.js";
import shopRoutes from "./modules/shop/routes/shop.routes.js";
import productRoutes from "./modules/product/routes/product.routes.js";
import categoryRoutes from "./modules/product/routes/category.routes.js";
import adminRoutes from "./modules/admin/routes/admin.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

logger.info(`Starting server on port ${PORT}...`);

// Connect to MongoDB
connectDB();

// Middleware
app.use(httpLogger); // logs every incoming request (method, path, status, response time)
// credentials: true + explicit origin (not "*") is required for cookies to work cross-origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler - must be last
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Catch errors that happen outside the request/response cycle
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection", { reason });
});
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", { stack: error.stack });
  process.exit(1);
});

export default app;
