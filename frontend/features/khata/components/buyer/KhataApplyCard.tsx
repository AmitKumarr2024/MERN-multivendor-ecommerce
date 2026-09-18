"use client";

import { useEffect, useState } from "react";
import { CreditCard, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    fetchShopKhataStatus,
    applyForKhata,
} from "../../store/khataSlice";
import {
    selectShopKhataStatus,
    selectKhataActionLoading,
} from "../../store/khataSelectors";
import KhataStatusBadge from "../shared/KhataStatusBadge";
import Modal from "@/components/ui/Modal";

export default function KhataApplyCard({ shopId }: { shopId: string }) {
    const dispatch = useAppDispatch();

    const status = useAppSelector(selectShopKhataStatus);
    const actionLoading = useAppSelector(selectKhataActionLoading);

    const [modalOpen, setModalOpen] = useState(false);
    const [note, setNote] = useState("");
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        dispatch(fetchShopKhataStatus(shopId));
    }, [dispatch, shopId]);

    if (!status || !status.khataEnabled || dismissed) {
        return null;
    }

    const { khata } = status;

    const canApply = !khata || khata.status === "rejected";

    const handleApply = async () => {
        await dispatch(
            applyForKhata({
                shopId,
                requestNote: note.trim() || undefined,
            })
        );

        setModalOpen(false);
        setNote("");
    };

    return (
        <>
            {/* =========================================================
                KHATA BANNER
               ========================================================= */}
            <div className="rounded-2xl border border-amber-300/80 bg-amber-50/70 p-3 sm:p-4 dark:border-amber-400/30 dark:bg-amber-400/5">
                <div className="flex items-center gap-3 sm:gap-4">
                    {/* =================================================
                        ICON
                       ================================================= */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                        <CreditCard className="h-6 w-6" strokeWidth={2} />
                    </div>

                    {/* =================================================
                        CONTENT
                       ================================================= */}
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p className="text-sm font-semibold text-primary sm:text-base">
                                Khata (Credit) available at this shop
                            </p>

                            {khata && (
                                <KhataStatusBadge status={khata.status} />
                            )}
                        </div>

                        <p className="mt-0.5 text-xs leading-5 text-secondary sm:text-sm">
                            {khata
                                ? khata.status === "rejected" &&
                                    khata.rejectionReason
                                    ? `Request rejected: ${khata.rejectionReason}`
                                    : "Track your request status below."
                                : "Buy now, pay later — apply for shop credit."}
                        </p>
                    </div>

                    {/* =================================================
                        APPLY BUTTON
                       ================================================= */}
                    {canApply && (
                        <button
                            type="button"
                            onClick={() => setModalOpen(true)}
                            disabled={actionLoading}
                            className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                        >
                            Apply for Khata
                        </button>
                    )}

                    {/* =================================================
                        DISMISS
                       ================================================= */}
                    <button
                        type="button"
                        onClick={() => setDismissed(true)}
                        aria-label="Dismiss Khata banner"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-black/5 hover:text-primary dark:hover:bg-white/10"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* =========================================================
                APPLY MODAL
               ========================================================= */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Apply for Khata"
                subtitle="The seller will review your request before you can use credit."
            >
                <div className="space-y-4">
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Optional note to the seller (e.g. you're a regular customer)"
                        maxLength={300}
                        rows={3}
                        className="w-full resize-none rounded-xl border border-default bg-surface p-3 text-sm text-primary outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/10"
                    />

                    <button
                        type="button"
                        onClick={handleApply}
                        disabled={actionLoading}
                        className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {actionLoading ? "Submitting..." : "Submit Request"}
                    </button>
                </div>
            </Modal>
        </>
    );
}