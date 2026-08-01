"use client";

import {
    useEffect,
    type ReactNode,
} from "react";

interface DrawerProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    side?: "left" | "right";
}

export default function Drawer({
    open,
    onClose,
    title,
    children,
    side = "left",
}: DrawerProps) {
    useEffect(() => {
        if (!open) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () =>
            document.removeEventListener(
                "keydown",
                handleEscape,
            );
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                aria-label="Close drawer"
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            <aside
                role="dialog"
                aria-modal="true"
                className={`
                    absolute top-0 h-full w-[85%] max-w-sm
                    overflow-y-auto bg-white shadow-xl
                    dark:bg-zinc-900
                    ${side === "left"
                        ? "left-0"
                        : "right-0"
                    }
                `}
            >
                {title && (
                    <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
                        <h2 className="font-bold text-zinc-950 dark:text-white">
                            {title}
                        </h2>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="p-4">
                    {children}
                </div>
            </aside>
        </div>
    );
}