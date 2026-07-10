import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import logger from "./logs/logger.js";
import httpLogger from "./middleware/httpLogger.js";
import errorHandler from "./middleware/errorHandler.js";
import initSocket from "./sockets/index.js";
import authRoutes from "./modules/auth/auth.routes.js";
import shopRoutes from "./modules/shop/routes/shop.routes.js";
import productRoutes from "./modules/product/routes/product.routes.js";
import categoryRoutes from "./modules/product/routes/category.routes.js";
import adminRoutes from "./modules/admin/routes/admin.routes.js";
import cartRoutes from "./modules/cart/routes/cart.routes.js";
import orderRoutes from "./modules/order/routes/order.routes.js";
import conversationRoutes from "./modules/messagingSystem/routes/conversation.routes.js";
import broadcastRoutes from "./modules/messagingSystem/routes/broadcast.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

logger.info(`Starting server on port ${PORT}...`);

// Connect to MongoDB
connectDB();

// Middleware
app.use(httpLogger);
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
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages/broadcasts", broadcastRoutes);
app.use("/api/messages", conversationRoutes);

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
