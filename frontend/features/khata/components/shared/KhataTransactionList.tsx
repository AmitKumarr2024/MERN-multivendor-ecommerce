"use client";

import { ArrowDownLeft, ArrowUpRight, FileClock } from "lucide-react";
import type { KhataTransaction } from "../../types/khata.types";

const TYPE_LABELS: Record<KhataTransaction["type"], string> = {
    credit_purchase: "Purchase (Credit)",
    payment: "Payment received",
    adjustment: "Adjustment",
};

export default function KhataTransactionList({ transactions }: { transactions: KhataTransaction[] }) {
    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-default py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-muted">
                    <FileClock className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-medium text-primary">No transactions yet</p>
                <p className="mt-0.5 text-xs text-muted">Ledger entries will appear here.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-default">
            <div className="max-h-96 divide-y divide-default overflow-y-auto">
                {transactions.map((txn) => {
                    const isDebit = txn.amount >= 0;

                    return (
                        <div
                            key={txn._id}
                            className="flex items-center gap-3 p-3.5 transition-colors hover:bg-surface-hover sm:p-4"
                        >
                            <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isDebit
                                    ? "bg-danger-bg text-danger-text"
                                    : "bg-success-bg text-success-text"
                                    }`}
                            >
                                {isDebit ? (
                                    <ArrowUpRight className="h-4 w-4" />
                                ) : (
                                    <ArrowDownLeft className="h-4 w-4" />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-primary">
                                    {TYPE_LABELS[txn.type]}
                                </p>
                                <p className="mt-0.5 truncate text-xs text-muted">
                                    {new Date(txn.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                    {txn.note ? ` · ${txn.note}` : ""}
                                    {txn.settledAt ? " · Settled" : ""}
                                </p>
                            </div>

                            <div className="shrink-0 text-right">
                                <p
                                    className={`text-sm font-bold ${isDebit ? "text-danger-text" : "text-success-text"
                                        }`}
                                >
                                    {isDebit ? "+" : "−"}₹{Math.abs(txn.amount).toLocaleString("en-IN")}
                                </p>
                                <p className="mt-0.5 text-[11px] text-muted">
                                    Bal ₹{txn.balanceAfter.toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}