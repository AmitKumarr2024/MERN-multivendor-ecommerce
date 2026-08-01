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

// Only forward, sensible transitions - matches what a seller would realistically do.
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
        <div className="mx-auto max-w-5xl space-y-4 p-4 sm:space-y-6 sm:p-6">
            <div>
                <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Orders</h1>
                <p className="text-sm text-gray-500">Orders placed with your shop.</p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
                {STATUS_FILTERS.map((f) => (
                    <button
                        key={f.value}
                        type="button"
                        onClick={() => setStatusFilter(f.value)}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                            statusFilter === f.value
                                ? "bg-gray-900 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {error ? (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            ) : null}

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-24 animate-pulse rounded-2xl border border-gray-200 bg-gray-50"
                        />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center text-sm text-gray-500">
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
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <p className="text-sm font-semibold text-gray-900">
                        #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                        {buyer?.name ?? "Buyer"} · {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""} ·{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                        })}
                    </p>
                </div>
                <OrderStatusBadge status={order.orderStatus} />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
                <p className="text-sm font-semibold text-gray-900">
                    ₹{order.grandTotal.toLocaleString("en-IN")}
                    <span className="ml-2 text-xs font-normal text-gray-400">
                        {order.paymentMethod === "cod" ? "Cash on delivery" : "Paid online"}
                    </span>
                </p>

                <div className="flex gap-2">
                    {order.orderStatus === "confirmed" && !order.shipment.awbCode && (
                        <button
                            type="button"
                            onClick={onShip}
                            disabled={busy}
                            className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                        >
                            {busy ? "Shipping..." : "Ship this order"}
                        </button>
                    )}

                    {nextStatus && order.orderStatus !== "confirmed" && (
                        <button
                            type="button"
                            onClick={onAdvanceStatus}
                            disabled={busy}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            {busy ? "Updating..." : `Mark as ${nextStatus}`}
                        </button>
                    )}

                    {order.orderStatus === "confirmed" && (
                        <button
                            type="button"
                            onClick={onAdvanceStatus}
                            disabled={busy}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Mark as shipped (skip courier)
                        </button>
                    )}
                </div>
            </div>

            {order.shipment.awbCode && (
                <p className="mt-2 text-xs text-gray-400">
                    AWB: {order.shipment.awbCode} · {order.shipment.courierName ?? "Courier assigned"}
                </p>
            )}
        </div>
    );
}