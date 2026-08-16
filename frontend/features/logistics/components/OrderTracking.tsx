"use client";

import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrderTracking } from "@/features/order/store/orderSlice"; 
import { selectOrderTracking, selectTrackingLoading } from "@/features/order/store/orderSelectors";
import type { ShipmentHistoryEntry } from "../types/logistics.types";

interface OrderTrackingProps {
    orderId: string;
}

const STATUS_LABELS: Record<string, string> = {
    pickup_scheduled: "Pickup scheduled",
    in_transit: "In transit",
    out_for_delivery: "Out for delivery",
    delivered: "Delivered",
    returned: "Returned",
};

function formatDateTime(value: string): string {
    return new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function OrderTracking({ orderId }: OrderTrackingProps) {
    const dispatch = useAppDispatch();
    const tracking = useAppSelector(selectOrderTracking);
    const loading = useAppSelector(selectTrackingLoading);

    useEffect(() => {
        dispatch(fetchOrderTracking(orderId));
    }, [dispatch, orderId]);

    if (loading) {
        return <div className="h-32 animate-pulse rounded-2xl bg-surface-muted" />;
    }

    if (!tracking || !tracking.shipment?.awbCode) {
        return (
            <div className="rounded-2xl border border-dashed border-default bg-surface p-6 text-center text-sm text-muted">
                This order hasn&apos;t been shipped yet.
            </div>
        );
    }

    const { shipment, liveTracking } = tracking;
    // Prefer live courier data if available, fall back to our last-known snapshot.
    const history: ShipmentHistoryEntry[] =
        liveTracking?.history?.length ? liveTracking.history : shipment.history;
    const currentStatus = liveTracking?.status ?? shipment.status;

    return (
        <div className="rounded-2xl border border-default bg-surface p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h2 className="text-base font-semibold text-primary">Shipment tracking</h2>
                    <p className="mt-0.5 text-sm text-secondary">
                        {shipment.courierName ?? "Courier"} · AWB {shipment.awbCode}
                    </p>
                </div>
                {shipment.trackingUrl && (
                    <a
                        href={shipment.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                        Track on courier site →
                    </a>
                )}
            </div>

            {currentStatus && (
                <span className="mt-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                    {STATUS_LABELS[currentStatus] ?? currentStatus}
                </span>
            )}

            {history.length > 0 ? (
                <ol className="mt-5 space-y-4 border-l border-default pl-4">
                    {[...history].reverse().map((entry, i) => (
                        <li key={`${entry.status}-${entry.occurredAt}-${i}`} className="relative">
                            <span
                                className={`absolute -left-5.25 top-1 h-2.5 w-2.5 rounded-full ${i === 0 ? "bg-zinc-900 dark:bg-zinc-100" : "bg-muted"
                                    }`}
                            />
                            <p className="text-sm font-medium text-primary">
                                {STATUS_LABELS[entry.status] ?? entry.status}
                            </p>
                            <p className="text-xs text-secondary">{entry.message}</p>
                            <p className="mt-0.5 text-xs text-muted">
                                {formatDateTime(entry.occurredAt)}
                            </p>
                        </li>
                    ))}
                </ol>
            ) : (
                <p className="mt-4 text-sm text-muted">No tracking updates yet.</p>
            )}
        </div>
    );
}