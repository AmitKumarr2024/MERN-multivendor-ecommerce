"use client";

import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrdersAdmin, forceDeleteOrderAdmin } from "../store/Adminslice";
import {
    selectAdminError,
    selectAdminMutatingId,
    selectAdminOrders,
    selectOrdersLoading,
    selectOrdersPage,
    selectOrdersPages,
    selectOrdersTotal,
} from "../store/Adminselectors";

const STATUS_FILTERS = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
// Matches backend rule: force-delete only allowed once cancelled or delivered.
const DELETABLE_STATUSES = ["cancelled", "delivered"];

function formatPrice(value: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
}

export default function AdminOrdersTable() {
    const dispatch = useAppDispatch();

    const orders = useAppSelector(selectAdminOrders);
    const total = useAppSelector(selectOrdersTotal);
    const page = useAppSelector(selectOrdersPage);
    const pages = useAppSelector(selectOrdersPages);
    const loading = useAppSelector(selectOrdersLoading);
    const error = useAppSelector(selectAdminError);
    const mutatingId = useAppSelector(selectAdminMutatingId);

    const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(
            fetchOrdersAdmin({
                orderStatus: statusFilter === "all" ? undefined : statusFilter,
                page: currentPage,
            }),
        );
    }, [dispatch, statusFilter, currentPage]);

    const handleDelete = (id: string) => {
        if (confirmDeleteId !== id) {
            setConfirmDeleteId(id);
            return;
        }
        dispatch(forceDeleteOrderAdmin(id));
        setConfirmDeleteId(null);
    };

    return (
        <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
            <div>
                <h1 className="text-xl font-semibold text-primary sm:text-2xl">Orders</h1>
                {!loading && <p className="text-sm text-secondary">{total} total orders</p>}
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="flex gap-2 overflow-x-auto pb-1">
                {STATUS_FILTERS.map((s) => (
                    <button
                        key={s}
                        type="button"
                        onClick={() => {
                            setStatusFilter(s);
                            setCurrentPage(1);
                        }}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors ${statusFilter === s
                                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                : "bg-surface-muted text-secondary hover:bg-surface-hover"
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-muted" />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => {
                        const shop = typeof order.shop === "string" ? null : order.shop;
                        const buyer = typeof order.buyer === "string" ? null : order.buyer;
                        const busy = mutatingId === order._id;
                        const confirming = confirmDeleteId === order._id;
                        const canDelete = DELETABLE_STATUSES.includes(order.orderStatus);

                        return (
                            <div
                                key={order._id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-default bg-surface p-4 shadow-sm"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-primary">
                                        #{order._id.slice(-8).toUpperCase()} · {shop?.shopName ?? "Shop"}
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted">
                                        {buyer?.name ?? "Buyer"} · {buyer?.email ?? ""}
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-primary">
                                        {formatPrice(order.grandTotal)}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium capitalize text-secondary">
                                        {order.orderStatus}
                                    </span>

                                    {canDelete && (
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(order._id)}
                                            disabled={busy}
                                            className={`rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${confirming
                                                    ? "bg-red-600 text-white hover:bg-red-700"
                                                    : "border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                                                }`}
                                        >
                                            {confirming ? "Confirm delete" : "Delete"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="rounded-lg border border-default px-3 py-1.5 text-sm text-secondary disabled:opacity-40"
                    >
                        Prev
                    </button>
                    <span className="text-sm text-secondary">
                        Page {page} of {pages}
                    </span>
                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(pages, p + 1))}
                        disabled={page >= pages}
                        className="rounded-lg border border-default px-3 py-1.5 text-sm text-secondary disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}