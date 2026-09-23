import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import logger from "./logs/logger.js";
import httpLogger from "./middleware/httpLogger.js";
import errorHandler from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import initSocket from "./sockets/index.js";
import authRoutes from "./modules/auth/routes/auth.routes.js";
import shopRoutes from "./modules/shop/routes/shop.routes.js";
import productRoutes from "./modules/product/routes/product.routes.js";
import categoryRoutes from "./modules/product/routes/category.routes.js";
import adminRoutes from "./modules/admin/routes/admin.routes.js";
import cartRoutes from "./modules/cart/routes/cart.routes.js";
import orderRoutes from "./modules/order/routes/order.routes.js";
import conversationRoutes from "./modules/messagingSystem/routes/conversation.routes.js";
import broadcastRoutes from "./modules/messagingSystem/routes/broadcast.routes.js";
import uploadRoutes from "./modules/upload/routes/upload.routes.js";
import logisticsRoutes from "./modules/logistics/routes/logistics.routes.js";
import wishlistRoutes from "./modules/wishlist/routes/wishlist.routes.js";
import notificationRoutes from "./modules/notification/routes/notification.routes.js";
import reviewRoutes from "./modules/review/routes/review.routes.js";
import shopStaffRoutes from "./modules/staff/routes/shopStaff.routes.js";
import staffRoutes from "./modules/staff/routes/staff.routes.js";
import shopKhataRoutes from "./modules/khata/routes/shopKhata.routes.js";
import khataRoutes from "./modules/khata/routes/khata.routes.js";
import followRoutes from "./modules/follow/routes/follow.routes.js";
import shopCustomersRoutes from "./modules/follow/routes/shopCustomers.routes.js";
import shopLoyaltyRoutes from "./modules/loyalty/routes/shopLoyalty.routes.js";
import loyaltyRoutes from "./modules/loyalty/routes/loyalty.routes.js";
import shopOfferRoutes from "./modules/offer/routes/shopOffer.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

logger.info(`Starting server on port ${PORT}...`);

// Connect to MongoDB
// ------------------------------------------------------------------
// Skipped during tests (NODE_ENV === "test"). Test files use their own
// isolated mongodb-memory-server connection (see tests/setup/db.js).
//
// Without this guard, simply IMPORTING this file — even accidentally,
// via a shared import chain in a test — connects to the REAL database
// (whatever MONGO_URI points to). If that test file then runs cleanup
// hooks like `collection.deleteMany({})` in afterEach, it wipes the
// REAL database instead of the throwaway in-memory one. This is exactly
// what happened once during development — see PROJECT_HANDOFF notes.
//
// In dev and production this behaves identically to before: connectDB()
// still runs immediately on startup, nothing else changes.
// ------------------------------------------------------------------
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Middleware
app.use(httpLogger); // logs every incoming request (method, path, status, response time)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global rate limiter - applies to every /api route. Individual routes (like
// auth login/register) additionally stack a stricter authLimiter on top.
// Automatically disabled during tests (NODE_ENV === "test").
app.use("/api", apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages/broadcasts", broadcastRoutes);
app.use("/api/messages", conversationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/logistics", logisticsRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/shops/:shopId/staff", shopStaffRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/shops/:shopId/khata", shopKhataRoutes);
app.use("/api/khata", khataRoutes);
app.use("/api/shops/:shopId/customers", shopCustomersRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/shops/:shopId/loyalty", shopLoyaltyRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/shops/:shopId/offers", shopOfferRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler - must be last
app.use(errorHandler);

// Socket.io needs a raw HTTP server (not just the Express app) to attach to,
// so we wrap app in http.createServer and listen on that instead of app.listen()
const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} (HTTP + WebSocket)`);
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
