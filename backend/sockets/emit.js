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

export const emitNotification = (recipientUserId, notification) => {
  const io = getIO();
  if (!io) {
    console.log(
      "❌ emitNotification: io instance is null (socket server not initialized yet?)",
    );
    return;
  }
  const room = `user:${recipientUserId}`;
  const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
  console.log(
    `📡 Emitting "notification:new" to room "${room}" — ${roomSize} socket(s) connected`,
  );
  io.to(room).emit("notification:new", notification);
};
