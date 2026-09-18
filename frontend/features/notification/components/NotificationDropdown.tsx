"use client";

import { useRouter } from "next/navigation";
import {
    Bell,
    CheckCheck,
    ChevronRight,
    Loader2,
} from "lucide-react";

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

    const notifications = useAppSelector(
        selectAllNotifications,
    );

    const loading = useAppSelector(
        selectNotificationLoading,
    );

    const role = useAppSelector(
        selectUserRole,
    );

    const notificationsHref =
        role === "seller"
            ? "/seller/notifications"
            : "/buyer/notifications";

    const unreadCount = notifications.filter(
        (notification) =>
            !notification.isRead,
    ).length;

    const handleItemClick = (
        id: string,
        link: string | null,
    ) => {
        dispatch(
            markNotificationRead(id),
        );

        onClose();

        if (link) {
            router.push(link);
        }
    };

    const handleMarkAllRead = () => {
        if (unreadCount > 0) {
            dispatch(
                markAllNotificationsRead(),
            );
        }
    };

    return (
        <div
            className="
                absolute
                right-0
                z-50
                mt-3
                w-[calc(100vw-2rem)]
                max-w-[390px]
                overflow-hidden
                rounded-2xl
                border
                border-default
                bg-surface
                shadow-2xl
                shadow-black/10
                dark:shadow-black/30
            "
        >
            {/* Header */}
            <div className="border-b border-default px-4 py-3.5">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                            <Bell className="h-5 w-5" />

                            {unreadCount > 0 && (
                                <span
                                    className="
                                        absolute
                                        -right-1
                                        -top-1
                                        flex
                                        h-5
                                        min-w-5
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-red-500
                                        px-1
                                        text-[9px]
                                        font-bold
                                        text-white
                                        ring-2
                                        ring-surface
                                    "
                                >
                                    {unreadCount > 99
                                        ? "99+"
                                        : unreadCount}
                                </span>
                            )}
                        </div>

                        <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-primary">
                                Notifications
                            </h3>

                            <p className="mt-0.5 text-xs text-muted">
                                {unreadCount > 0
                                    ? `${unreadCount} unread notification${
                                          unreadCount === 1
                                              ? ""
                                              : "s"
                                      }`
                                    : "You're all caught up"}
                            </p>
                        </div>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={handleMarkAllRead}
                            className="
                                inline-flex
                                shrink-0
                                items-center
                                gap-1.5
                                rounded-lg
                                px-2.5
                                py-1.5
                                text-[11px]
                                font-semibold
                                text-secondary
                                transition-colors
                                hover:bg-surface-hover
                                hover:text-primary
                            "
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">
                                Mark all read
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-h-[min(520px,65vh)] overflow-y-auto">
                {loading &&
                    notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                            <Loader2 className="h-5 w-5 animate-spin text-muted" />

                            <p className="mt-3 text-sm font-medium text-secondary">
                                Loading notifications...
                            </p>
                        </div>
                    )}

                {!loading &&
                    notifications.length === 0 && (
                        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-muted">
                                <Bell className="h-6 w-6" />
                            </div>

                            <h4 className="mt-4 text-sm font-semibold text-primary">
                                No notifications yet
                            </h4>

                            <p className="mt-1 max-w-[240px] text-xs leading-5 text-muted">
                                We'll let you know when
                                something important happens.
                            </p>
                        </div>
                    )}

                {notifications.length > 0 && (
                    <ul className="divide-y divide-default">
                        {notifications.map(
                            (notification) => (
                                <li
                                    key={
                                        notification._id
                                    }
                                    className={`
                                        relative
                                        transition-colors
                                        hover:bg-surface-hover
                                        ${
                                            !notification.isRead
                                                ? "bg-accent/[0.035]"
                                                : ""
                                        }
                                    `}
                                >
                                    {!notification.isRead && (
                                        <span
                                            className="
                                                absolute
                                                left-1.5
                                                top-1/2
                                                h-1.5
                                                w-1.5
                                                -translate-y-1/2
                                                rounded-full
                                                bg-accent
                                            "
                                        />
                                    )}

                                    <NotificationItem
                                        notification={
                                            notification
                                        }
                                        onClick={() =>
                                            handleItemClick(
                                                notification._id,
                                                notification.link,
                                            )
                                        }
                                    />
                                </li>
                            ),
                        )}
                    </ul>
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="border-t border-default bg-surface-muted/30 p-2">
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            router.push(
                                notificationsHref,
                            );
                        }}
                        className="
                            flex
                            w-full
                            items-center
                            justify-center
                            gap-1
                            rounded-xl
                            py-2.5
                            text-xs
                            font-bold
                            text-secondary
                            transition-colors
                            hover:bg-surface-hover
                            hover:text-primary
                        "
                    >
                        View all notifications
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
}