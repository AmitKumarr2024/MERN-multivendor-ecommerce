"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchUnreadCount,
  fetchNotifications,
} from "../store/notificationSlice";
import { selectUnreadCount } from "../store/notificationSelectors";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationBell() {
  const dispatch = useAppDispatch();
  const unreadCount = useAppSelector(selectUnreadCount);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchUnreadCount());

    // Fallback polling — safety net in case a socket event is missed
    // (tab was backgrounded, brief disconnect, etc). Live push via
    // "notification:new" is still the primary path.
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      dispatch(fetchNotifications({ page: 1, limit: 10 }));
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative p-2 rounded-full hover:bg-surface-hover transition-colors"
      >
        <Bell className="w-5 h-5 text-primary" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && <NotificationDropdown onClose={() => setOpen(false)} />}
    </div>
  );
}