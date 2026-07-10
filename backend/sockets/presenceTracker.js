/**
 * PRESENCE TRACKER
 * ------------------------------------------------------------------
 * In-memory tracking of which users currently have an active socket
 * connection. A user can have multiple sockets open (multiple tabs/
 * devices) - we only consider them "offline" once ALL of their
 * sockets have disconnected.
 *
 * NOTE: this is per-process memory. If you ever run multiple server
 * instances behind a load balancer, this needs to move to Redis
 * (e.g. via the socket.io-redis adapter) so presence is shared across
 * instances. Fine for a single-instance deployment.
 * ------------------------------------------------------------------
 */

const onlineUsers = new Map(); // userId (string) -> Set of socket.id

export const markOnline = (userId, socketId) => {
  const id = userId.toString();
  if (!onlineUsers.has(id)) {
    onlineUsers.set(id, new Set());
  }
  onlineUsers.get(id).add(socketId);

  const wasAlreadyOnline = onlineUsers.get(id).size > 1;
  return { justCameOnline: !wasAlreadyOnline };
};

export const markOffline = (userId, socketId) => {
  const id = userId.toString();
  const sockets = onlineUsers.get(id);
  if (!sockets) return { wentOffline: false };

  sockets.delete(socketId);
  if (sockets.size === 0) {
    onlineUsers.delete(id);
    return { wentOffline: true };
  }
  return { wentOffline: false };
};

export const isOnline = (userId) => onlineUsers.has(userId.toString());
