"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { recordKhataPayment } from "../../store/khataSlice";
import { selectKhataActionLoading } from "../../store/khataSelectors";
import type { Khata } from "../../types/khata.types";
import Modal from "@/components/ui/Modal";

export default function KhataRecordPaymentModal({
    khata,
    open,
    onClose,
}: {
    khata: Khata;
    open: boolean;
    onClose: () => void;
}) {
    const dispatch = useAppDispatch();
    const actionLoading = useAppSelector(selectKhataActionLoading);
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [error, setError] = useState("");

    const amountValue = Number(amount);
    const isValid = amount.trim() !== "" && amountValue > 0;

    const handleSubmit = async () => {
        if (!isValid) return;
        if (amountValue > khata.outstandingBalance) {
            setError("Payment cannot exceed the outstanding balance.");
            return;
        }
        setError("");
        await dispatch(
            recordKhataPayment({ id: khata._id, amount: amountValue, note: note.trim() || undefined }),
        );
        setAmount("");
        setNote("");
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Record Payment"
            subtitle={`Outstanding: ₹${khata.outstandingBalance.toLocaleString("en-IN")}`}
        >
            <div className="space-y-4">
                <div className="flex items-start gap-2.5 rounded-xl bg-accent/10 p-3 text-xs text-accent">
                    <Wallet className="h-4 w-4 shrink-0" />
                    <span>This reduces the buyer's outstanding balance and is logged in their ledger.</span>
                </div>

                <div>
                    <label className="text-sm font-semibold text-primary">Amount received</label>
                    <div className="relative mt-1.5">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted">
                            ₹
                        </span>
                        <input
                            type="number"
                            min={1}
                            max={khata.outstandingBalance}
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                setError("");
                            }}
                            autoFocus
                            placeholder="0"
                            className="w-full rounded-xl border border-default bg-surface py-2.5 pl-8 pr-3 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-semibold text-primary">Note (optional)</label>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        maxLength={300}
                        placeholder="e.g. Cash payment at shop"
                        className="mt-1.5 w-full rounded-xl border border-default bg-surface p-2.5 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10"
                    />
                </div>

                {error && <p className="text-sm text-danger-text">{error}</p>}

                <button
                    onClick={handleSubmit}
                    disabled={!isValid || actionLoading}
                    className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {actionLoading ? "Recording..." : "Record Payment"}
                </button>
            </div>
        </Modal>
    );
}