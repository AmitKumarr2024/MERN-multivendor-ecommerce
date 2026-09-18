"use client";

import { useState } from "react";
import { XCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { rejectKhata } from "../../store/khataSlice";
import { selectKhataActionLoading } from "../../store/khataSelectors";
import type { Khata } from "../../types/khata.types";
import Modal from "@/components/ui/Modal";

export default function KhataRejectModal({
    khata,
    onClose,
}: {
    khata: Khata | null;
    onClose: () => void;
}) {
    const dispatch = useAppDispatch();
    const actionLoading = useAppSelector(selectKhataActionLoading);
    const [reason, setReason] = useState("");

    if (!khata) return null;

    const buyer = typeof khata.buyer === "string" ? null : khata.buyer;
    const isValid = reason.trim().length > 0;

    const handleReject = async () => {
        if (!isValid) return;
        await dispatch(rejectKhata({ id: khata._id, rejectionReason: reason.trim() }));
        setReason("");
        onClose();
    };

    return (
        <Modal open={!!khata} onClose={onClose} title="Reject Khata Request" subtitle={buyer?.name}>
            <div className="space-y-4">
                <div className="flex items-start gap-2.5 rounded-xl bg-danger-bg p-3 text-xs text-danger-text">
                    <XCircle className="h-4 w-4 shrink-0" />
                    <span>The buyer will be notified with the reason below.</span>
                </div>

                <div>
                    <label className="text-sm font-semibold text-primary">Reason</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        maxLength={300}
                        autoFocus
                        placeholder="Let the buyer know why this was rejected"
                        className="mt-1.5 w-full rounded-xl border border-default bg-surface p-3 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10"
                    />
                    <p className="mt-1 text-right text-[11px] text-muted">{reason.length}/300</p>
                </div>

                <button
                    onClick={handleReject}
                    disabled={!isValid || actionLoading}
                    className="w-full rounded-xl border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                    {actionLoading ? "Rejecting..." : "Reject Request"}
                </button>
            </div>
        </Modal>
    );
}