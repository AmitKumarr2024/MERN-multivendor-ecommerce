"use client";

import { useEffect, useState } from "react";
import {
    Wallet,
    CreditCard,
    PauseCircle,
    PlayCircle,
    CalendarClock,
    Mail,
    Phone,
    Receipt,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    fetchTransactionHistory,
    suspendKhata,
    reactivateKhata,
    updateCreditLimit,
} from "../../store/khataSlice";
import {
    selectKhataTransactions,
    selectKhataActionLoading,
    selectAvailableCredit,
} from "../../store/khataSelectors";
import type { Khata } from "../../types/khata.types";
import KhataStatusBadge from "../shared/KhataStatusBadge";
import KhataTransactionList from "../shared/KhataTransactionList";
import KhataRecordPaymentModal from "./KhataRecordPaymentModal";
import KhataCloseMonthModal from "./KhataCloseMonthModal";
import Modal from "@/components/ui/Modal";

export default function KhataDetailPanel({ khata }: { khata: Khata }) {
    const dispatch = useAppDispatch();
    const transactions = useAppSelector(selectKhataTransactions);
    const actionLoading = useAppSelector(selectKhataActionLoading);
    const available = selectAvailableCredit(khata);

    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [closeMonthOpen, setCloseMonthOpen] = useState(false);
    const [suspendOpen, setSuspendOpen] = useState(false);
    const [limitOpen, setLimitOpen] = useState(false);
    const [suspendReason, setSuspendReason] = useState("");
    const [newLimit, setNewLimit] = useState(String(khata.creditLimit));

    const buyer = typeof khata.buyer === "string" ? null : khata.buyer;
    const initial = (buyer?.name ?? "B").charAt(0).toUpperCase();
    const usagePct =
        khata.creditLimit > 0
            ? Math.min(100, Math.round((khata.outstandingBalance / khata.creditLimit) * 100))
            : 0;

    useEffect(() => {
        dispatch(fetchTransactionHistory({ id: khata._id, asSeller: true }));
    }, [dispatch, khata._id]);

    const handleSuspend = async () => {
        if (!suspendReason.trim()) return;
        await dispatch(suspendKhata({ id: khata._id, suspendedReason: suspendReason.trim() }));
        setSuspendReason("");
        setSuspendOpen(false);
    };

    const handleUpdateLimit = async () => {
        const val = Number(newLimit);
        if (!val || val <= 0) return;
        await dispatch(updateCreditLimit({ id: khata._id, creditLimit: val }));
        setLimitOpen(false);
    };

    return (
        <div className="space-y-5">
            {/* ===================== BUYER HEADER ===================== */}
            <div className="flex items-start justify-between gap-3 rounded-2xl border border-default bg-surface-muted/50 p-4">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-accent to-purple-500 text-base font-bold text-accent-foreground">
                        {initial}
                    </div>
                    <div className="min-w-0">
                        <h2 className="truncate text-base font-bold text-primary">{buyer?.name ?? "Buyer"}</h2>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
                            {buyer?.email && (
                                <span className="inline-flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {buyer.email}
                                </span>
                            )}
                            {buyer?.phone && (
                                <span className="inline-flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {buyer.phone}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <KhataStatusBadge status={khata.status} />
            </div>

            {khata.status === "suspended" && khata.suspendedReason && (
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800 dark:border-orange-900/40 dark:bg-orange-900/20 dark:text-orange-300">
                    <span className="font-semibold">Suspended:</span> {khata.suspendedReason}
                </div>
            )}

            {/* ===================== STATS ===================== */}
            <div className="grid grid-cols-3 gap-3">
                <Stat label="Credit Limit" value={khata.creditLimit} icon={CreditCard} />
                <Stat label="Outstanding" value={khata.outstandingBalance} icon={Receipt} tone="danger" />
                <Stat label="Available" value={available} icon={Wallet} tone="accent" />
            </div>

            {khata.status !== "pending" && khata.status !== "rejected" && (
                <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-muted">Credit utilization</span>
                        <span className="font-semibold text-primary">{usagePct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                        <div
                            className={`h-full rounded-full transition-all ${usagePct >= 90 ? "bg-danger-text" : "bg-accent"
                                }`}
                            style={{ width: `${usagePct}%` }}
                        />
                    </div>
                </div>
            )}

            {/* ===================== ACTIONS ===================== */}
            <div className="flex flex-wrap gap-2">
                <ActionButton
                    onClick={() => setPaymentModalOpen(true)}
                    disabled={khata.status !== "approved" && khata.status !== "suspended"}
                    icon={Wallet}
                    label="Record Payment"
                    variant="primary"
                />
                <ActionButton onClick={() => setLimitOpen(true)} icon={CreditCard} label="Update Limit" />
                {khata.status === "approved" && (
                    <ActionButton
                        onClick={() => setSuspendOpen(true)}
                        icon={PauseCircle}
                        label="Suspend"
                        variant="warning"
                    />
                )}
                {khata.status === "suspended" && (
                    <ActionButton
                        onClick={() => dispatch(reactivateKhata(khata._id))}
                        disabled={actionLoading}
                        icon={PlayCircle}
                        label="Reactivate"
                        variant="success"
                    />
                )}
                <ActionButton onClick={() => setCloseMonthOpen(true)} icon={CalendarClock} label="Close Month" />
            </div>

            {/* ===================== HISTORY ===================== */}
            <div>
                <h3 className="mb-2 text-sm font-bold text-primary">Transaction History</h3>
                <KhataTransactionList transactions={transactions} />
            </div>

            <KhataRecordPaymentModal khata={khata} open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} />
            <KhataCloseMonthModal khataId={khata._id} open={closeMonthOpen} onClose={() => setCloseMonthOpen(false)} />

            <Modal open={suspendOpen} onClose={() => setSuspendOpen(false)} title="Suspend Khata">
                <div className="space-y-4">
                    <textarea
                        value={suspendReason}
                        onChange={(e) => setSuspendReason(e.target.value)}
                        rows={3}
                        maxLength={300}
                        placeholder="Reason for suspending this Khata"
                        className="w-full rounded-xl border border-default bg-surface p-3 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10"
                    />
                    <button
                        onClick={handleSuspend}
                        disabled={!suspendReason.trim() || actionLoading}
                        className="w-full rounded-xl border border-orange-300 px-4 py-2.5 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-orange-900/50 dark:text-orange-400 dark:hover:bg-orange-900/20"
                    >
                        {actionLoading ? "Suspending..." : "Suspend Khata"}
                    </button>
                </div>
            </Modal>

            <Modal open={limitOpen} onClose={() => setLimitOpen(false)} title="Update Credit Limit">
                <div className="space-y-4">
                    <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted">
                            ₹
                        </span>
                        <input
                            type="number"
                            min={1}
                            value={newLimit}
                            onChange={(e) => setNewLimit(e.target.value)}
                            className="w-full rounded-xl border border-default bg-surface py-2.5 pl-8 pr-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10"
                        />
                    </div>
                    <p className="text-xs text-muted">
                        Cannot be set below the current outstanding balance (₹
                        {khata.outstandingBalance.toLocaleString("en-IN")}).
                    </p>
                    <button
                        onClick={handleUpdateLimit}
                        disabled={actionLoading}
                        className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {actionLoading ? "Updating..." : "Update Limit"}
                    </button>
                </div>
            </Modal>
        </div>
    );
}

/* =========================================================
   STAT
========================================================= */

function Stat({
    label,
    value,
    icon: Icon,
    tone,
}: {
    label: string;
    value: number;
    icon: React.ElementType;
    tone?: "accent" | "danger";
}) {
    const iconClasses =
        tone === "accent"
            ? "bg-accent/10 text-accent"
            : tone === "danger"
                ? "bg-danger-bg text-danger-text"
                : "bg-surface-muted text-secondary";

    const valueClasses = tone === "accent" ? "text-accent" : tone === "danger" ? "text-danger-text" : "text-primary";

    return (
        <div className="rounded-xl border border-default bg-surface p-3">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconClasses}`}>
                <Icon className="h-3.5 w-3.5" />
            </div>
            <p className={`mt-2 truncate text-sm font-bold ${valueClasses}`}>
                ₹{value.toLocaleString("en-IN")}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-muted">{label}</p>
        </div>
    );
}

/* =========================================================
   ACTION BUTTON
========================================================= */

function ActionButton({
    onClick,
    icon: Icon,
    label,
    disabled,
    variant = "default",
}: {
    onClick: () => void;
    icon: React.ElementType;
    label: string;
    disabled?: boolean;
    variant?: "default" | "primary" | "warning" | "success";
}) {
    const styles = {
        default: "border border-default text-secondary hover:bg-surface-hover",
        primary: "bg-accent text-accent-foreground hover:opacity-90",
        warning:
            "border border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-900/50 dark:text-orange-400 dark:hover:bg-orange-900/20",
        success:
            "border border-success-text/30 text-success-text hover:bg-success-bg",
    }[variant];

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles}`}
        >
            <Icon className="h-3.5 w-3.5" />
            {label}
        </button>
    );
}