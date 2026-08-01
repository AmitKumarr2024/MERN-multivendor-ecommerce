"use client";

import Modal from "./Modal";
import Button from "./Button";

interface DialogProps {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    loading?: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export default function Dialog({
    open,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    danger = false,
    loading = false,
    onConfirm,
    onClose,
}: DialogProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
        >
            <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                {description}
            </p>

            <div className="mt-6 flex justify-end gap-3">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    disabled={loading}
                >
                    {cancelLabel}
                </Button>

                <Button
                    type="button"
                    variant={danger ? "danger" : "primary"}
                    loading={loading}
                    onClick={onConfirm}
                >
                    {confirmLabel}
                </Button>
            </div>
        </Modal>
    );
}