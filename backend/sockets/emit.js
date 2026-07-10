import { getIO } from "./io.js";

/**
 * Thin wrapper functions around io.to(room).emit(...) so controllers
 * don't need to know room-naming conventions or handle a possibly-null
 * io instance themselves.
 */

export const emitNewMessage = (recipientUserId, message) => {
  const io = getIO();
  if (!io) return;
  io.to(`user:${recipientUserId}`).emit("message:new", message);
};

export const emitShopBroadcast = (shopSlug, broadcast) => {
  const io = getIO();
  if (!io) return;
  io.to(`shop:${shopSlug}`).emit("broadcast:shop", broadcast);
};

export const emitPlatformBroadcast = (broadcast) => {
  const io = getIO();
  if (!io) return;
  io.to("platform").emit("broadcast:platform", broadcast);
};

export const emitOrderStatusUpdate = (buyerUserId, orderUpdate) => {
  const io = getIO();
  if (!io) return;
  io.to(`user:${buyerUserId}`).emit("order:status-update", orderUpdate);
};

export const emitNewOrderToSeller = (sellerUserId, order) => {
  const io = getIO();
  if (!io) return;
  io.to(`user:${sellerUserId}`).emit("order:new", order);
};
