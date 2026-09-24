"use client";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    fetchShopReservations, confirmReservation, rejectReservation,
    markReservationReady, markReservationCollected, cancelReservation,
} from "../../store/reservationSlice";
import { selectShopReservations, selectShopReservationsLoading, selectReservationActionLoading } from "../../store/reservationSelectors";
import ReservationStatusBadge from "../ReservationStatusBadge";
import type { ReservationStatus } from "../../types/reservation.types";

const TABS: { value: ReservationStatus | "all"; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "ready", label: "Ready" },
    { value: "collected", label: "Collected" },
    { value: "cancelled", label: "Cancelled" },
    { value: "all", label: "All" },
];

export default function SellerReservationsList({ shopId }: { shopId: string }) {
    const dispatch = useAppDispatch();
    const reservations = useAppSelector(selectShopReservations);
    const loading = useAppSelector(selectShopReservationsLoading);
    const acting = useAppSelector(selectReservationActionLoading);
    const [tab, setTab] = useState<ReservationStatus | "all">("pending");
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [reason, setReason] = useState("");

    useEffect(() => {
        dispatch(fetchShopReservations({ shopId, status: tab === "all" ? undefined : tab }));
    }, [dispatch, shopId, tab]);

    const submitReject = async (id: string) => {
        if (!reason.trim()) return;
        await dispatch(rejectReservation({ id, rejectionReason: reason.trim() }));
        setRejectingId(null);
        setReason("");
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto">
                {TABS.map((t) => (
                    <button key={t.value} onClick={() => setTab(t.value)}
                        className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${tab === t.value ? "bg-accent text-accent-foreground" : "bg-surface-muted text-secondary hover:bg-surface-hover"}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="h-40 animate-pulse rounded-2xl bg-surface-muted" />
            ) : reservations.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-default py-12 text-center text-sm text-secondary">No reservations in this category.</p>
            ) : (
                <div className="space-y-3">
                    {reservations.map((r) => {
                        const buyer = typeof r.buyer === "string" ? null : r.buyer;
                        return (
                            <div key={r._id} className="rounded-2xl border border-default bg-surface p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-primary">{r.productName}{r.variantLabel ? ` (${r.variantLabel})` : ""}</p>
                                        <p className="mt-0.5 text-xs text-muted">{buyer?.name ?? "Buyer"} · Qty {r.quantity} · ₹{r.unitPrice * r.quantity}</p>
                                    </div>
                                    <ReservationStatusBadge status={r.status} />
                                </div>

                                {r.status === "pending" && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <button onClick={() => dispatch(confirmReservation(r._id))} disabled={acting}
                                            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground disabled:opacity-50">Confirm</button>
                                        <button onClick={() => setRejectingId(r._id)} disabled={acting}
                                            className="rounded-lg border border-default px-3 py-1.5 text-xs font-semibold text-secondary hover:bg-surface-hover">Reject</button>
                                    </div>
                                )}
                                {r.status === "confirmed" && (
                                    <button onClick={() => dispatch(markReservationReady(r._id))} disabled={acting}
                                        className="mt-3 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground disabled:opacity-50">Mark ready for pickup</button>
                                )}
                                {r.status === "ready" && (
                                    <button onClick={() => dispatch(markReservationCollected(r._id))} disabled={acting}
                                        className="mt-3 rounded-lg bg-success-bg px-3 py-1.5 text-xs font-semibold text-success-text disabled:opacity-50">Mark collected</button>
                                )}
                                {["pending", "confirmed", "ready"].includes(r.status) && (
                                    <button onClick={() => dispatch(cancelReservation({ id: r._id, asSeller: true, reason: "Cancelled by seller" }))}
                                        disabled={acting} className="mt-3 ml-2 text-xs font-semibold text-danger-text hover:underline disabled:opacity-50">
                                        Cancel
                                    </button>
                                )}

                                {rejectingId === r._id && (
                                    <div className="mt-3 space-y-2 rounded-xl bg-surface-muted p-3">
                                        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} maxLength={300}
                                            placeholder="Reason for rejecting" className="w-full rounded-lg border border-default bg-surface p-2 text-xs text-primary" />
                                        <div className="flex gap-2">
                                            <button onClick={() => submitReject(r._id)} disabled={!reason.trim() || acting}
                                                className="rounded-lg bg-danger-bg px-3 py-1.5 text-xs font-semibold text-danger-text disabled:opacity-50">Confirm reject</button>
                                            <button onClick={() => { setRejectingId(null); setReason(""); }} className="text-xs text-secondary">Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}