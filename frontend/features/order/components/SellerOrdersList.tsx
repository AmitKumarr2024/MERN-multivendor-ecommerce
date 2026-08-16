"use client";

import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchShopOrders, updateOrderStatus, shipOrder } from "../store/orderSlice";
import {
    selectMutatingOrderId,
    selectOrderError,
    selectShopOrders,
    selectShopOrdersLoading,
} from "../store/orderSelectors";
import type { Order, OrderStatus } from "../types/order.types";
import OrderStatusBadge from "./OrderStatusBadge";

const STATUS_FILTERS: { value: OrderStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
    pending: "confirmed",
    confirmed: "shipped",
    shipped: "delivered",
};

export default function SellerOrdersList() {
    const dispatch = useAppDispatch();

    const orders = useAppSelector(selectShopOrders);
    const loading = useAppSelector(selectShopOrdersLoading);
    const error = useAppSelector(selectOrderError);
    const mutatingId = useAppSelector(selectMutatingOrderId);

    const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

    useEffect(() => {
        dispatch(fetchShopOrders(statusFilter === "all" ? undefined : { status: statusFilter }));
    }, [dispatch, statusFilter]);

    const handleAdvanceStatus = (order: Order) => {
        const next = NEXT_STATUS[order.orderStatus];
        if (!next) return;
        dispatch(updateOrderStatus({ id: order._id, status: next }));
    };

    const handleShip = (order: Order) => {
        dispatch(shipOrder(order._id));
    };

    return (
        <div className="mx-auto max-w-7xl space-y-4 p-4 sm:space-y-6 sm:p-6">
            <div>
                <h1 className="text-xl font-semibold text-primary sm:text-2xl">Orders</h1>
                <p className="text-sm text-secondary">Orders placed with your shop.</p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
                {STATUS_FILTERS.map((f) => (
                    <button
                        key={f.value}
                        type="button"
                        onClick={() => setStatusFilter(f.value)}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${statusFilter === f.value
                                ? "bg-accent text-accent-foreground"
                                : "bg-surface-muted text-secondary hover:bg-surface-hover"
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {error ? (
                <div className="rounded-lg bg-danger-bg px-4 py-3 text-sm text-danger-text">{error}</div>
            ) : null}

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-24 animate-pulse rounded-2xl border border-default bg-surface-muted" />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-default bg-surface py-16 text-center text-sm text-secondary">
                    No orders here yet.
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => (
                        <OrderRow
                            key={order._id}
                            order={order}
                            busy={mutatingId === order._id}
                            onAdvanceStatus={() => handleAdvanceStatus(order)}
                            onShip={() => handleShip(order)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface OrderRowProps {
    order: Order;
    busy: boolean;
    onAdvanceStatus: () => void;
    onShip: () => void;
}

function OrderRow({ order, busy, onAdvanceStatus, onShip }: OrderRowProps) {
    const buyer = typeof order.buyer === "string" ? null : order.buyer;
    const nextStatus = NEXT_STATUS[order.orderStatus];

    return (
        <div className="rounded-2xl border border-default bg-surface p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold text-secondary">
                        {(buyer?.name ?? "B").charAt(0).toUpperCase()}
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-primary">
                            #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="mt-0.5 text-xs text-secondary">
                            {buyer?.name ?? "Buyer"} · {order.items.length} item
                            {order.items.length !== 1 ? "s" : ""} ·{" "}
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                            })}
                        </p>
                    </div>
                </div>
                <OrderStatusBadge status={order.orderStatus} />
            </div>

            <div className="mt-3 flex flex-col gap-3 border-t border-default pt-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-primary">
                    ₹{order.grandTotal.toLocaleString("en-IN")}
                    <span className="ml-2 text-xs font-normal text-muted">
                        {order.paymentMethod === "cod" ? "Cash on delivery" : "Paid online"}
                    </span>
                </p>

                <div className="flex flex-wrap gap-2">
                    {order.orderStatus === "confirmed" && !order.shipment.awbCode && (
                        <button
                            type="button"
                            onClick={onShip}
                            disabled={busy}
                            className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground disabled:opacity-50"
                        >
                            {busy ? "Shipping..." : "Ship this order"}
                        </button>
                    )}

                    {nextStatus && order.orderStatus !== "confirmed" && (
                        <button
                            type="button"
                            onClick={onAdvanceStatus}
                            disabled={busy}
                            className="rounded-lg border border-strong px-3 py-1.5 text-xs font-medium text-primary hover:bg-surface-hover disabled:opacity-50"
                        >
                            {busy ? "Updating..." : `Mark as ${nextStatus}`}
                        </button>
                    )}

                    {order.orderStatus === "confirmed" && (
                        <button
                            type="button"
                            onClick={onAdvanceStatus}
                            disabled={busy}
                            className="rounded-lg border border-strong px-3 py-1.5 text-xs font-medium text-primary hover:bg-surface-hover disabled:opacity-50"
                        >
                            Mark as shipped (skip courier)
                        </button>
                    )}
                </div>
            </div>

            {order.shipment.awbCode && (
                <p className="mt-2 text-xs text-muted">
                    AWB: {order.shipment.awbCode} · {order.shipment.courierName ?? "Courier assigned"}
                </p>
            )}
        </div>
    );
}