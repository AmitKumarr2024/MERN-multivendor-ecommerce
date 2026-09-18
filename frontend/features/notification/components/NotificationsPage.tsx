"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  ChevronRight,
  Inbox,
  Loader2,
  Trash2,
} from "lucide-react";

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

type NotificationFilter =
  | "all"
  | "unread"
  | "read";

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const notifications = useAppSelector(
    selectAllNotifications,
  );

  const loading = useAppSelector(
    selectNotificationLoading,
  );

  const hasMore = useAppSelector(
    selectHasMoreNotifications,
  );

  const [filter, setFilter] =
    useState<NotificationFilter>(
      "all",
    );

  useEffect(() => {
    dispatch(
      fetchNotifications({
        page: 1,
        limit: 20,
      }),
    );
  }, [dispatch]);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !notification.isRead,
      ).length,
    [notifications],
  );

  const readCount =
    notifications.length -
    unreadCount;

  const filteredNotifications =
    useMemo(() => {
      if (filter === "unread") {
        return notifications.filter(
          (notification) =>
            !notification.isRead,
        );
      }

      if (filter === "read") {
        return notifications.filter(
          (notification) =>
            notification.isRead,
        );
      }

      return notifications;
    }, [notifications, filter]);

  const handleClick = (
    id: string,
    link: string | null,
  ) => {
    dispatch(
      markNotificationRead(id),
    );

    if (link) {
      router.push(link);
    }
  };

  const handleLoadMore = () => {
    const nextPage =
      Math.floor(
        notifications.length / 20,
      ) + 1;

    dispatch(
      fetchNotifications({
        page: nextPage,
        limit: 20,
      }),
    );
  };

  const filters: {
    value: NotificationFilter;
    label: string;
    count: number;
  }[] = [
      {
        value: "all",
        label: "All",
        count: notifications.length,
      },
      {
        value: "unread",
        label: "Unread",
        count: unreadCount,
      },
      {
        value: "read",
        label: "Read",
        count: readCount,
      },
    ];

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* =================================================
                    HEADER
                ================================================= */}

        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <Bell className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight text-primary sm:text-2xl">
                Notifications
              </h1>

              <p className="mt-0.5 text-xs text-secondary sm:text-sm">
                Stay updated with activity
                from your account.
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() =>
                dispatch(
                  markAllNotificationsRead(),
                )
              }
              className="
                                inline-flex
                                w-fit
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-default
                                bg-surface
                                px-3
                                py-2
                                text-xs
                                font-bold
                                text-primary
                                transition-all
                                hover:bg-surface-hover
                            "
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
          )}
        </header>

        {/* =================================================
                    SUMMARY
                ================================================= */}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <SummaryCard
            label="Total"
            value={notifications.length}
            icon={
              <Inbox className="h-4 w-4" />
            }
          />

          <SummaryCard
            label="Unread"
            value={unreadCount}
            icon={
              <Bell className="h-4 w-4" />
            }
            active={
              unreadCount > 0
            }
          />

          <SummaryCard
            label="Read"
            value={readCount}
            icon={
              <CheckCheck className="h-4 w-4" />
            }
            className="hidden sm:block"
          />
        </div>

        {/* =================================================
                    FILTERS
                ================================================= */}

        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1">
          {filters.map(
            (item) => (
              <button
                key={
                  item.value
                }
                type="button"
                onClick={() =>
                  setFilter(
                    item.value,
                  )
                }
                className={`
                                    inline-flex
                                    shrink-0
                                    items-center
                                    gap-2
                                    rounded-xl
                                    px-3.5
                                    py-2
                                    text-xs
                                    font-bold
                                    transition-all
                                    ${filter ===
                    item.value
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "bg-surface-muted text-secondary hover:bg-surface-hover hover:text-primary"
                  }
                                `}
              >
                {item.label}

                <span
                  className={`
                                        rounded-md
                                        px-1.5
                                        py-0.5
                                        text-[10px]
                                        ${filter ===
                      item.value
                      ? "bg-black/10 dark:bg-white/15"
                      : "bg-surface"
                    }
                                    `}
                >
                  {item.count}
                </span>
              </button>
            ),
          )}
        </div>

        {/* =================================================
                    NOTIFICATION LIST
                ================================================= */}

        <section className="mt-4 overflow-hidden rounded-2xl border border-default bg-surface shadow-sm sm:rounded-3xl">
          {loading &&
            notifications.length ===
            0 && (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted" />

                <p className="mt-3 text-sm font-medium text-secondary">
                  Loading notifications...
                </p>
              </div>
            )}

          {!loading &&
            filteredNotifications.length ===
            0 && (
              <EmptyNotifications
                filter={filter}
              />
            )}

          {filteredNotifications.length >
            0 && (
              <ul className="divide-y divide-default">
                {filteredNotifications.map(
                  (
                    notification,
                  ) => (
                    <NotificationPageItem
                      key={
                        notification._id
                      }
                      notification={
                        notification
                      }
                      onClick={() =>
                        handleClick(
                          notification._id,
                          notification.link,
                        )
                      }
                      onDelete={() =>
                        dispatch(
                          deleteNotification(
                            notification._id,
                          ),
                        )
                      }
                    />
                  ),
                )}
              </ul>
            )}
        </section>

        {/* =================================================
                    LOAD MORE
                ================================================= */}

        {hasMore && (
          <button
            type="button"
            onClick={
              handleLoadMore
            }
            disabled={
              loading
            }
            className="
                            mt-4
                            flex
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-2xl
                            border
                            border-default
                            bg-surface
                            px-4
                            py-3
                            text-xs
                            font-bold
                            text-primary
                            transition-colors
                            hover:bg-surface-hover
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Load more
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>
    </main>
  );
}

/* =========================================================
   NOTIFICATION ITEM
========================================================= */

function NotificationPageItem({
  notification,
  onClick,
  onDelete,
}: {
  notification: any;
  onClick: () => void;
  onDelete: () => void;
}) {
  const unread =
    !notification.isRead;

  return (
    <li
      className={`
                group
                relative
                transition-colors
                ${unread
          ? "bg-accent/[0.035]"
          : "bg-surface"
        }
                hover:bg-surface-hover
            `}
    >
      {unread && (
        <span className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-accent sm:left-3" />
      )}

      <div className="flex items-center">
        <div className="min-w-0 flex-1">
          <NotificationItem
            notification={
              notification
            }
            onClick={
              onClick
            }
          />
        </div>

        <button
          type="button"
          onClick={
            onDelete
          }
          className="
                        mr-2
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        text-muted
                        opacity-100
                        transition-all
                        hover:bg-red-500/10
                        hover:text-red-500
                        sm:mr-3
                        sm:opacity-0
                        sm:group-hover:opacity-100
                    "
          aria-label="Delete notification"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  icon,
  active = false,
  className = "",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`
                rounded-2xl
                border
                border-default
                bg-surface
                p-4
                sm:rounded-3xl
                sm:p-5
                ${className}
            `}
    >
      <div
        className={`
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    ${active
            ? "bg-accent/10 text-accent"
            : "bg-surface-muted text-secondary"
          }
                `}
      >
        {icon}
      </div>

      <p className="mt-3 text-xl font-black text-primary">
        {value}
      </p>

      <p className="mt-0.5 text-xs font-medium text-muted">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyNotifications({
  filter,
}: {
  filter: NotificationFilter;
}) {
  const title =
    filter === "unread"
      ? "You're all caught up"
      : filter === "read"
        ? "No read notifications"
        : "No notifications yet";

  const description =
    filter === "unread"
      ? "There are no unread notifications waiting for you."
      : filter === "read"
        ? "Your read notifications will appear here."
        : "We'll show important updates and activity here.";

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center sm:py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-surface-muted text-muted">
        <Bell className="h-7 w-7" />
      </div>

      <h2 className="mt-5 text-sm font-bold text-primary sm:text-base">
        {title}
      </h2>

      <p className="mt-1 max-w-sm text-xs leading-5 text-muted">
        {description}
      </p>
    </div>
  );
}