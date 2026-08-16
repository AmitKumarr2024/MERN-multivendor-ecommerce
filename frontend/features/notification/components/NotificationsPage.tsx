"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../store/notificationSlice";
import {
  selectAllNotifications,
  selectNotificationLoading,
  selectHasMoreNotifications,
} from "../store/notificationSelectors";
import NotificationItem from "./NotificationItem";
import { Trash2 } from "lucide-react";

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const notifications = useAppSelector(selectAllNotifications);
  const loading = useAppSelector(selectNotificationLoading);
  const hasMore = useAppSelector(selectHasMoreNotifications);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 20 }));
  }, [dispatch]);

  const handleClick = (id: string, link: string | null) => {
    dispatch(markNotificationRead(id));
    if (link) router.push(link);
  };

  const handleLoadMore = () => {
    const nextPage = Math.floor(notifications.length / 20) + 1;
    dispatch(fetchNotifications({ page: nextPage, limit: 20 }));
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-primary">Notifications</h1>
        {notifications.length > 0 && (
          <button
            onClick={() => dispatch(markAllNotificationsRead())}
            className="text-sm text-blue-500 hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {loading && notifications.length === 0 && (
        <p className="text-center text-muted py-12">Loading...</p>
      )}

      {!loading && notifications.length === 0 && (
        <p className="text-center text-muted py-12">
          You have no notifications yet.
        </p>
      )}

      <ul className="divide-y divide-default rounded-lg border border-default bg-surface overflow-hidden">
        {notifications.map((n) => (
          <li key={n._id} className="flex items-center group">
            <div className="flex-1">
              <NotificationItem
                notification={n}
                onClick={() => handleClick(n._id, n.link)}
              />
            </div>
            <button
              onClick={() => dispatch(deleteNotification(n._id))}
              className="px-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-red-500"
              aria-label="Delete notification"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>

      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className="mt-4 w-full py-2 text-sm text-blue-500 hover:underline disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}