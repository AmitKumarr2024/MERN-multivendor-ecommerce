"use client";

import {
    useEffect,
    type ReactNode,
} from "react";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}

export default function Modal({
    open,
    onClose,
    title,
    children,
}: ModalProps) {
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
                className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-zinc-900"
            >
                {title && (
                    <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                        <h2 className="font-bold text-zinc-950 dark:text-white">
                            {title}
                        </h2>
                    </div>
                )}

                <div className="p-5">
                    {children}
                </div>
            </div>
        </div>
    );
}