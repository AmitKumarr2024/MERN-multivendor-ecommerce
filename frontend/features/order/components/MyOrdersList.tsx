"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyOrders } from "../store/orderSlice";
import { selectMyOrders, selectMyOrdersLoading, selectOrderError } from "../store/orderSelectors";
import type { OrderStatus } from "../types/order.types";
import OrderStatusBadge from "./OrderStatusBadge";

const STATUS_FILTERS: { value: OrderStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
];

function formatPrice(value: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
}

export default function MyOrdersList() {
    const dispatch = useAppDispatch();
    const orders = useAppSelector(selectMyOrders);
    const loading = useAppSelector(selectMyOrdersLoading);
    const error = useAppSelector(selectOrderError);

    const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

    useEffect(() => {
        dispatch(fetchMyOrders(statusFilter === "all" ? undefined : { status: statusFilter }));
    }, [dispatch, statusFilter]);

    return (
        <div className="mx-auto max-w-4xl space-y-4 p-4 sm:space-y-6 sm:p-6">
            <div>
                <h1 className="text-xl font-semibold text-primary sm:text-2xl">My Orders</h1>
                <p className="text-sm text-secondary">Your order history across all shops.</p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
                {STATUS_FILTERS.map((f) => (
                    <button
                        key={f.value}
                        type="button"
                        onClick={() => setStatusFilter(f.value)}
                        className={`... ${statusFilter === f.value
                            ? "bg-accent text-accent-foreground"
                            : "bg-surface-muted text-secondary hover:bg-surface-hover"
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {error ? (
                <div className="rounded-lg bg-danger-bg px-4 py-3 text-sm text-danger-text">
                    {error}
                </div>
            ) : null}

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-muted" />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-default bg-surface py-16 text-center">
                    <p className="text-sm text-secondary">No orders yet.</p>
                    <Link
                        href="/products"
                        className="mt-3 text-sm font-medium text-info-text hover:opacity-80"
                    >
                        Start shopping →
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => {
                        const shop = typeof order.shop === "string" ? null : order.shop;
                        return (
                            <Link
                                key={order._id}
                                href={`/buyer/orders/${order._id}`}
                                className="block rounded-2xl border border-default bg-surface p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-semibold text-primary">
                                            {shop?.shopName ?? "Order"} · #
                                            {order._id.slice(-8).toUpperCase()}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted">
                                            {order.items.length} item
                                            {order.items.length !== 1 ? "s" : ""} ·{" "}
                                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <OrderStatusBadge status={order.orderStatus} />
                                </div>
                                <p className="mt-2 text-sm font-semibold text-primary">
                                    {formatPrice(order.grandTotal)}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}