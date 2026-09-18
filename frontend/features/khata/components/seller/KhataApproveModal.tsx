"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { approveKhata } from "../../store/khataSlice";
import { selectKhataActionLoading } from "../../store/khataSelectors";
import type { Khata } from "../../types/khata.types";
import Modal from "@/components/ui/Modal";

export default function KhataApproveModal({
    khata,
    onClose,
}: {
    khata: Khata | null;
    onClose: () => void;
}) {
    const dispatch = useAppDispatch();
    const actionLoading = useAppSelector(selectKhataActionLoading);
    const [creditLimit, setCreditLimit] = useState("");

    if (!khata) return null;

    const buyer = typeof khata.buyer === "string" ? null : khata.buyer;
    const limitValue = Number(creditLimit);
    const isValid = creditLimit.trim() !== "" && limitValue > 0;

    const handleApprove = async () => {
        if (!isValid) return;
        await dispatch(approveKhata({ id: khata._id, creditLimit: limitValue }));
        setCreditLimit("");
        onClose();
    };

    return (
        <Modal open={!!khata} onClose={onClose} title="Approve Khata Request" subtitle={buyer?.name}>
            <div className="space-y-4">
                <div className="flex items-start gap-2.5 rounded-xl bg-success-bg p-3 text-xs text-success-text">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Set a credit limit this buyer can use for purchases at your shop.</span>
                </div>

                <div>
                    <label className="text-sm font-semibold text-primary">Credit Limit</label>
                    <div className="relative mt-1.5">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted">
                            ₹
                        </span>
                        <input
                            type="number"
                            min={1}
                            value={creditLimit}
                            onChange={(e) => setCreditLimit(e.target.value)}
                            placeholder="5,000"
                            autoFocus
                            className="w-full rounded-xl border border-default bg-surface py-2.5 pl-8 pr-3 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10"
                        />
                    </div>
                </div>

                <button
                    onClick={handleApprove}
                    disabled={!isValid || actionLoading}
                    className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {actionLoading ? "Approving..." : "Approve Request"}
                </button>
            </div>
        </Modal>
    );
}