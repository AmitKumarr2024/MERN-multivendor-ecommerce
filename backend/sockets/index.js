import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import User from "../modules/auth/models/auth.model.js";
import Conversation from "../modules/messagingSystem/models/conversation.model.js";
import Shop from "../modules/shop/models/shop.model.js";
import { setIO } from "./io.js";
import { markOnline, markOffline } from "./presenceTracker.js";
import logger from "../logs/logger.js";

/**
 * SOCKET.IO SETUP
 * ------------------------------------------------------------------
 * Rooms used:
 *   user:<userId>         - personal room, joined automatically if the
 *                            socket is authenticated. Used to push new
 *                            chat messages and order-status updates
 *                            directly to the recipient.
 *   shop:<slug>            - joined by anyone viewing a dukan page (no
 *                            login required) so they receive that
 *                            shop's live offer broadcasts.
 *   platform                - joined by every connected client, used for
 *                            admin's site-wide toast broadcasts.
 *   conversation:<id>      - joined only by verified participants
 *                            (checked against the DB, not just trusted
 *                            from the client). Used for typing
 *                            indicators and online-presence pings
 *                            scoped to that conversation.
 * ------------------------------------------------------------------
 */

// Returns true if this user is either the buyer on the conversation,
// or the owner of the shop the conversation is with.
const isConversationParticipant = async (conversation, user) => {
  if (conversation.buyer.toString() === user._id.toString()) return true;
  const ownsShop = await Shop.exists({
    _id: conversation.shop,
    owner: user._id,
  });
  return Boolean(ownsShop);
};

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  // Try to authenticate the socket using the same httpOnly JWT cookie as REST.
  // Not required to connect - unauthenticated visitors still get shop/platform
  // broadcasts, they just won't get a personal `user:<id>` room.
  io.use(async (socket, next) => {
    try {
      const rawCookies = socket.handshake.headers.cookie;
      if (!rawCookies) return next();

      const parsedCookies = cookie.parse(rawCookies);
      const token = parsedCookies.token;
      if (!token) return next();

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (user && user.isActive) {
        socket.user = user;
      }
      next();
    } catch (error) {
      // Invalid/expired token - treat as an anonymous connection rather than
      // rejecting outright, since broadcasts should still work for them.
      next();
    }
  });

  io.on("connection", (socket) => {
    // Every client, authenticated or not, gets platform-wide toasts
    socket.join("platform");

    if (socket.user) {
      const userId = socket.user._id.toString();
      socket.join(`user:${userId}`);

      const { justCameOnline } = markOnline(userId, socket.id);
      logger.debug(`Socket connected: user ${userId}`);

      // Only announce "online" the first time this user's socket count goes 1 -> 1
      // (i.e. don't spam presence events if they have 3 tabs open)
      if (justCameOnline) {
        broadcastPresenceToUserConversations(userId, "presence:online");
      }
    } else {
      logger.debug(`Socket connected: anonymous (${socket.id})`);
    }

    // Visitor opens a dukan page -> subscribe to that shop's live offer broadcasts
    socket.on("join:shop", (slug) => {
      if (typeof slug === "string" && slug.length > 0) {
        socket.join(`shop:${slug.toLowerCase()}`);
      }
    });

    socket.on("leave:shop", (slug) => {
      if (typeof slug === "string" && slug.length > 0) {
        socket.leave(`shop:${slug.toLowerCase()}`);
      }
    });

    // Join a specific chat thread's room - verified against the DB first,
    // so a user can't listen in on a conversation they're not part of just
    // by guessing/sending its id.
    socket.on("join:conversation", async (conversationId) => {
      try {
        if (!socket.user || !conversationId) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const allowed = await isConversationParticipant(
          conversation,
          socket.user,
        );
        if (!allowed) {
          logger.debug(
            `Blocked join:conversation - user ${socket.user._id} is not a participant of ${conversationId}`,
          );
          return;
        }

        socket.join(`conversation:${conversationId}`);
      } catch (error) {
        logger.error("Error in join:conversation", { stack: error.stack });
      }
    });

    socket.on("leave:conversation", (conversationId) => {
      if (conversationId) socket.leave(`conversation:${conversationId}`);
    });

    // Typing indicator - broadcast to everyone else in the conversation room
    // (the sender doesn't need to see their own "typing" event)
    socket.on("typing:start", (conversationId) => {
      if (socket.user && conversationId) {
        socket.to(`conversation:${conversationId}`).emit("typing:start", {
          conversationId,
          userId: socket.user._id,
        });
      }
    });

    socket.on("typing:stop", (conversationId) => {
      if (socket.user && conversationId) {
        socket.to(`conversation:${conversationId}`).emit("typing:stop", {
          conversationId,
          userId: socket.user._id,
        });
      }
    });

    socket.on("disconnect", () => {
      if (socket.user) {
        const userId = socket.user._id.toString();
        const { wentOffline } = markOffline(userId, socket.id);
        logger.debug(`Socket disconnected: user ${userId}`);

        // Only announce "offline" once ALL of this user's tabs/devices are gone
        if (wentOffline) {
          broadcastPresenceToUserConversations(userId, "presence:offline");
        }
      } else {
        logger.debug(`Socket disconnected: anonymous (${socket.id})`);
      }
    });
  });

  // Tells the other participant(s) of every conversation this user is in
  // that their online status changed. Queries the DB for their conversations
  // rather than relying on which conversation rooms happen to be joined,
  // since a user might not have opened their inbox yet this session.
  const broadcastPresenceToUserConversations = async (userId, event) => {
    try {
      const shop = await Shop.findOne({ owner: userId }).select("_id");
      const conversations = await Conversation.find(
        shop
          ? { $or: [{ buyer: userId }, { shop: shop._id }] }
          : { buyer: userId },
      ).select("_id");

      for (const conversation of conversations) {
        io.to(`conversation:${conversation._id}`).emit(event, { userId });
      }
    } catch (error) {
      logger.error("Error broadcasting presence", { stack: error.stack });
    }
  };

  setIO(io);
  logger.info("Socket.io initialized");

  return io;
};

export default initSocket;
