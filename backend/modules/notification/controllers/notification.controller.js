import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../../../services/notification.service.js";

/**
 * NOTIFICATION CONTROLLER
 * ------------------------------------------------------------------
 *   1. getMyNotifications  -> GET   /api/notifications
 *   2. getMyUnreadCount     -> GET   /api/notifications/unread-count
 *   3. markOneAsRead         -> PATCH /api/notifications/:id/read
 *   4. markAllRead            -> PATCH /api/notifications/mark-all-read
 *   5. removeNotification      -> DELETE /api/notifications/:id
 * ------------------------------------------------------------------
 */

export const getMyNotifications = async (req, res, next) => {
  try {
    const { page, limit, unreadOnly } = req.query;
    const result = await getUserNotifications(req.user._id, {
      page,
      limit,
      unreadOnly: unreadOnly === "true",
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getMyUnreadCount = async (req, res, next) => {
  try {
    const count = await getUnreadCount(req.user._id);
    res.json({ count });
  } catch (error) {
    next(error);
  }
};

export const markOneAsRead = async (req, res, next) => {
  try {
    const notification = await markAsRead(req.params.id, req.user._id);
    res.json(notification);
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    const result = await markAllAsRead(req.user._id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const removeNotification = async (req, res, next) => {
  try {
    await deleteNotification(req.params.id, req.user._id);
    res.json({ message: "Notification deleted" });
  } catch (error) {
    next(error);
  }
};