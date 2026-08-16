"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUserRole } from "@/features/auth/store/authSelector";
import {
  selectAllNotifications,
  selectNotificationLoading,
} from "../store/notificationSelectors";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "../store/notificationSlice";
import NotificationItem from "./NotificationItem";

export default function NotificationDropdown({
  onClose,
}: {
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const notifications = useAppSelector(selectAllNotifications);
  const loading = useAppSelector(selectNotificationLoading);
  const role = useAppSelector(selectUserRole);

  // Buyer aur seller dono ke liye correct "View all" route — messaging
  // feature ke messagesHref pattern jaisa hi
  const notificationsHref =
    role === "seller" ? "/seller/notifications" : "/buyer/notifications";

  const handleItemClick = (id: string, link: string | null) => {
    dispatch(markNotificationRead(id));
    onClose();
    if (link) router.push(link);
  };

  return (
    <div className="absolute right-0 mt-2 w-80 max-h-[70vh] overflow-y-auto rounded-lg border border-default bg-surface shadow-lg z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-default">
        <h3 className="font-semibold text-primary text-sm">Notifications</h3>
        {notifications.length > 0 && (
          <button
            onClick={() => dispatch(markAllNotificationsRead())}
            className="text-xs text-blue-500 hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {loading && notifications.length === 0 && (
        <p className="px-4 py-6 text-sm text-muted text-center">Loading...</p>
      )}

      {!loading && notifications.length === 0 && (
        <p className="px-4 py-6 text-sm text-muted text-center">
          No notifications yet
        </p>
      )}

      <ul className="divide-y divide-default">
        {notifications.map((n) => (
          <NotificationItem
            key={n._id}
            notification={n}
            onClick={() => handleItemClick(n._id, n.link)}
          />
        ))}
      </ul>

      {notifications.length > 0 && (
        <button
          onClick={() => {
            onClose();
            router.push(notificationsHref);
          }}
          className="block w-full text-center text-xs text-blue-500 py-3 hover:underline border-t border-default"
        >
          View all
        </button>
      )}
    </div>
  );
}