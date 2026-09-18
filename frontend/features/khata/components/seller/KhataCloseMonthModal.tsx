"use client";

import { useState } from "react";
import { CalendarClock, CheckCircle2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeKhataMonth } from "../../store/khataSlice";
import { selectKhataActionLoading, selectLastSettlement } from "../../store/khataSelectors";
import Modal from "@/components/ui/Modal";

function currentMonth() {
    return new Date().toISOString().slice(0, 7);
}

export default function KhataCloseMonthModal({
    khataId,
    open,
    onClose,
}: {
    khataId: string;
    open: boolean;
    onClose: () => void;
}) {
    const dispatch = useAppDispatch();
    const actionLoading = useAppSelector(selectKhataActionLoading);
    const settlement = useAppSelector(selectLastSettlement);
    const [month, setMonth] = useState(currentMonth());
    const [confirmed, setConfirmed] = useState(false);

    const handleClose = async () => {
        await dispatch(closeKhataMonth({ id: khataId, statementMonth: month }));
        setConfirmed(true);
    };

    const handleDismiss = () => {
        setConfirmed(false);
        onClose();
    };

    return (
        <Modal open={open} onClose={handleDismiss} title="Close / Settle Month">
            {!confirmed ? (
                <div className="space-y-4">
                    <div className="flex items-start gap-2.5 rounded-xl bg-surface-muted p-3 text-xs text-secondary">
                        <CalendarClock className="h-4 w-4 shrink-0" />
                        <span>
                            This marks the month's transactions as settled for record-keeping. Historical
                            transactions are never deleted — this only creates a settlement snapshot.
                        </span>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-primary">Statement month</label>
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="mt-1.5 w-full rounded-xl border border-default bg-surface p-2.5 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10"
                        />
                    </div>

                    <button
                        onClick={handleClose}
                        disabled={actionLoading}
                        className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {actionLoading ? "Closing..." : "Confirm & Close Month"}
                    </button>
                </div>
            ) : (
                settlement && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2.5 rounded-xl bg-success-bg p-3 text-sm font-semibold text-success-text">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            Month {settlement.statementMonth} closed successfully.
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <SettlementStat label="Opening" value={settlement.openingBalance} />
                            <SettlementStat label="Closing" value={settlement.closingBalance} highlight />
                            <SettlementStat label="Credits" value={settlement.totalCredits} />
                            <SettlementStat label="Payments" value={settlement.totalPayments} />
                        </div>

                        <button
                            onClick={handleDismiss}
                            className="w-full rounded-xl border border-default px-4 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-surface-hover"
                        >
                            Done
                        </button>
                    </div>
                )
            )}
        </Modal>
    );
}

function SettlementStat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
    return (
        <div className={`rounded-xl border border-default p-3 ${highlight ? "bg-accent/10" : "bg-surface"}`}>
            <p className="text-[11px] text-muted">{label}</p>
            <p className={`mt-0.5 text-sm font-bold ${highlight ? "text-accent" : "text-primary"}`}>
                ₹{value.toLocaleString("en-IN")}
            </p>
        </div>
    );
}