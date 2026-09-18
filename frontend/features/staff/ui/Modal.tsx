"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    onClose: () => void;
    children: React.ReactNode;
    maxWidth?: "sm" | "md" | "lg" | "xl";
}

const WIDTH_MAP = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-2xl",
};

export default function Modal({ title, subtitle, icon, onClose, children, maxWidth = "md" }: ModalProps) {
    useEffect(() => {
        const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onEsc);
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onEsc);
            document.body.style.overflow = original;
        };
    }, [onClose]);

    if (typeof document === "undefined") return null;

    return createPortal(
        <div
            className="fixed inset-0 z-100 flex items-end justify-center bg-black/50 backdrop-blur-[2px] sm:items-center sm:p-4"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl border border-default bg-surface shadow-2xl sm:rounded-3xl ${WIDTH_MAP[maxWidth]}`}
            >
                <div className="flex shrink-0 items-center gap-3 border-b border-default px-5 py-4">
                    {icon && (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                            {icon}
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <h2 className="truncate text-base font-bold text-primary">{title}</h2>
                        {subtitle && <p className="mt-0.5 truncate text-xs text-secondary">{subtitle}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-secondary transition hover:bg-surface-muted hover:text-primary"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="overflow-y-auto">{children}</div>
            </div>
        </div>,
        document.body,
    );
}