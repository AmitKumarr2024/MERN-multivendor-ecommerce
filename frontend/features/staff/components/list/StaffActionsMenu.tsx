"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Edit3, MoreHorizontal, Power, Trash2 } from "lucide-react";

interface StaffActionsMenuProps {
  isActive: boolean;
  onOpenAttendance: () => void;
  onOpenEdit: () => void;
  onToggleStatus: () => void;
  onRemove: () => void;
}

export default function StaffActionsMenu({
  isActive,
  onOpenAttendance,
  onOpenEdit,
  onToggleStatus,
  onRemove,
}: StaffActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleOpen = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 176;
      const menuHeight = 176;
      let top = rect.bottom + window.scrollY + 4;
      if (rect.bottom + menuHeight > window.innerHeight) top = rect.top + window.scrollY - menuHeight - 4;
      setPosition({ top, left: Math.min(rect.right + window.scrollX - menuWidth, window.innerWidth - menuWidth - 8) });
    }
    setOpen((v) => !v);
  };

  const item = (icon: React.ReactNode, label: string, onClick: () => void, danger = false) => (
    <button
      type="button"
      onClick={() => {
        onClick();
        setOpen(false);
      }}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition ${danger ? "text-danger-text hover:bg-danger-bg" : "text-primary hover:bg-surface-muted"
        }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        aria-label="More actions"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary transition hover:bg-surface-muted hover:text-primary"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "absolute", top: position.top, left: position.left }}
            className="z-50 w-44 rounded-xl border border-default bg-surface p-1 shadow-lg"
          >
            {item(<CalendarDays className="h-3.5 w-3.5" />, "Attendance", onOpenAttendance)}
            {item(<Edit3 className="h-3.5 w-3.5" />, "Edit", onOpenEdit)}
            {item(<Power className="h-3.5 w-3.5" />, isActive ? "Disable" : "Enable", onToggleStatus)}
            {item(<Trash2 className="h-3.5 w-3.5" />, "Remove", onRemove, true)}
          </div>,
          document.body,
        )}
    </>
  );
}