"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrderById, cancelMyOrder, clearCurrentOrder } from "../store/orderSlice";
import {
    selectCurrentOrder,
    selectOrderLoading,
    selectMutatingOrderId,
} from "../store/orderSelectors";
import { OrderTracking } from "@/features/logistics";
import OrderStatusBadge from "./OrderStatusBadge";

interface OrderDetailProps {
    orderId: string;
}

function formatPrice(value: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
}

export default function OrderDetail({ orderId }: OrderDetailProps) {
    const dispatch = useAppDispatch();
    const order = useAppSelector(selectCurrentOrder);
    const loading = useAppSelector(selectOrderLoading);
    const mutatingId = useAppSelector(selectMutatingOrderId);

    useEffect(() => {
        dispatch(fetchOrderById(orderId));
        return () => {
            dispatch(clearCurrentOrder());
        };
    }, [dispatch, orderId]);

    if (loading || !order) {
        return (
            <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
                <div className="h-32 animate-pulse rounded-2xl bg-surface-muted" />
                <div className="h-48 animate-pulse rounded-2xl bg-surface-muted" />
            </div>
        );
    }

    const shop = typeof order.shop === "string" ? null : order.shop;
    const canCancel = order.orderStatus === "pending" || order.orderStatus === "confirmed";
    const busy = mutatingId === order._id;

    const handleCancel = () => {
        dispatch(cancelMyOrder({ id: order._id }));
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
            <Link
                href="/buyer/orders"
                className="inline-flex items-center gap-1 text-sm text-secondary hover:text-primary"
            >
                ← Back to orders
            </Link>

            <div className="rounded-2xl border border-default bg-surface p-4 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <p className="text-sm font-semibold text-primary">
                            {shop?.shopName ?? "Order"} · #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                            Placed{" "}
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })}
                        </p>
                    </div>
                    <OrderStatusBadge status={order.orderStatus} />
                </div>

                {order.cancelReason && (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                        Cancelled: {order.cancelReason}
                    </p>
                )}

                <ul className="mt-4 divide-y divide-default">
                    {order.items.map((item) => (
                        <li key={item.product} className="flex gap-3 py-3">
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                                {item.image ? (
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        sizes="56px"
                                        className="object-cover"
                                    />
                                ) : null}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-primary">{item.name}</p>
                                <p className="text-xs text-muted">
                                    Qty {item.quantity} × {formatPrice(item.unitPrice)}
                                </p>
                            </div>
                            <p className="text-sm font-medium text-primary">
                                {formatPrice(item.subtotal)}
                            </p>
                        </li>
                    ))}
                </ul>

                <div className="mt-4 space-y-1.5 border-t border-default pt-4 text-sm">
                    <div className="flex justify-between text-secondary">
                        <span>Subtotal</span>
                        <span>{formatPrice(order.itemsSubtotal)}</span>
                    </div>
                    {order.shippingCost > 0 && (
                        <div className="flex justify-between text-secondary">
                            <span>Shipping</span>
                            <span>{formatPrice(order.shippingCost)}</span>
                        </div>
                    )}
                    {order.discount > 0 && (
                        <div className="flex justify-between text-secondary">
                            <span>Discount</span>
                            <span>-{formatPrice(order.discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between pt-1 text-base font-semibold text-primary">
                        <span>Total</span>
                        <span>{formatPrice(order.grandTotal)}</span>
                    </div>
                </div>

                {canCancel && (
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={busy}
                        className="mt-4 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                        {busy ? "Cancelling..." : "Cancel order"}
                    </button>
                )}
            </div>

            <div className="rounded-2xl border border-default bg-surface p-4 shadow-sm sm:p-6">
                <h2 className="mb-2 text-base font-semibold text-primary">Delivery address</h2>
                <p className="text-sm text-secondary">
                    {order.shippingAddress.fullName && (
                        <>
                            {order.shippingAddress.fullName}
                            <br />
                        </>
                    )}
                    {order.shippingAddress.street}, {order.shippingAddress.city}
                    {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}{" "}
                    {order.shippingAddress.pincode}
                    <br />
                    {order.shippingAddress.phone}
                </p>
            </div>

            <OrderTracking orderId={order._id} />
        </div>
    );
}