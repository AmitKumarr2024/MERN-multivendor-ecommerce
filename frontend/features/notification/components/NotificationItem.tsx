"use client";

import { formatDistanceToNow } from "date-fns";
import type { Notification } from "../types/notification.types";
import { NOTIFICATION_META } from "../types/notification.types";

export default function NotificationItem({
  notification,
  onClick,
}: {
  notification: Notification;
  onClick: () => void;
}) {
  const meta = NOTIFICATION_META[notification.type];

  return (
    <li
      onClick={onClick}
      className={`px-4 py-3 cursor-pointer hover:bg-surface-hover transition-colors ${
        !notification.isRead ? "bg-blue-50 dark:bg-blue-950/20" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
            !notification.isRead ? "bg-blue-500" : "bg-transparent"
          }`}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-primary truncate">
            {notification.title}
          </p>
          <p className="text-xs text-secondary line-clamp-2 mt-0.5">
            {notification.message}
          </p>
          <span className={`text-[11px] mt-1 inline-block ${meta.color}`}>
            {meta.label} ·{" "}
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
    </li>
  );
}