import Notification from "../modules/notification/models/notification.model.js";
import { emitNotification } from "../sockets/emit.js";
import { BadRequestError, NotFoundError } from "../exceptions/ApiError.js";

/**
 * NOTIFICATION SERVICE
 * ------------------------------------------------------------------
 * Every other module (order, logistics, messaging, shop, product) calls
 * `createNotification()` from here instead of touching the Notification
 * model or sockets/emit.js directly. This keeps "save to DB + push live
 * via socket" as ONE atomic-feeling call site, so nobody forgets one half.
 * ------------------------------------------------------------------
 */

export const createNotification = async ({
  recipient,
  type,
  title,
  message,
  link = null,
  relatedId = null,
  relatedModel = null,
}) => {
  if (!recipient || !type || !title || !message) {
    throw new BadRequestError(
      "recipient, type, title and message are required to create a notification",
    );
  }

  const notification = await Notification.create({
    recipient,
    type,
    title,
    message,
    link,
    relatedId,
    relatedModel,
  });
  // 👇 ADD THIS LINE (temporary debug)
  console.log(
    "📨 Notification created in DB, emitting to:",
    recipient.toString(),
  );

  // Live push if the user is currently connected — no-op safely if not
  // (emitNotification internally checks getIO()/room existence).
  emitNotification(recipient, notification);

  return notification;
};

// Bulk version — e.g. shop broadcast going out to many followers at once.
// Uses insertMany for DB efficiency, then emits individually over sockets.
export const createNotificationsBulk = async (recipients, base) => {
  if (!recipients?.length) return [];

  const docs = recipients.map((recipient) => ({ ...base, recipient }));
  const created = await Notification.insertMany(docs);

  for (const notification of created) {
    emitNotification(notification.recipient, notification);
  }

  return created;
};

export const getUserNotifications = async (
  userId,
  { page = 1, limit = 20, unreadOnly = false } = {},
) => {
  const query = { recipient: userId };
  if (unreadOnly) query.isRead = false;

  const safeLimit = Math.min(Number(limit) || 20, 100);
  const currentPage = Math.max(Number(page) || 1, 1);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * safeLimit)
      .limit(safeLimit),
    Notification.countDocuments(query),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);

  return {
    notifications,
    total,
    unreadCount,
    page: currentPage,
    pages: Math.ceil(total / safeLimit),
  };
};

export const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ recipient: userId, isRead: false });
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId,
  });
  if (!notification) {
    throw new NotFoundError("Notification not found");
  }
  if (!notification.isRead) {
    notification.isRead = true;
    await notification.save();
  }
  return notification;
};

export const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true } },
  );
  return { message: "All notifications marked as read" };
};

export const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
  });
  if (!notification) {
    throw new NotFoundError("Notification not found");
  }
  return notification;
};
