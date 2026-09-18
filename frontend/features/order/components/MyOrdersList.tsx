"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
    ArrowRight,
    CheckCircle2,
    Clock3,
    Package,
    ShoppingBag,
    Truck,
    XCircle,
} from "lucide-react";

import type { ReactNode } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { fetchMyOrders } from "../store/orderSlice";

import {
    selectMyOrders,
    selectMyOrdersLoading,
    selectOrderError,
} from "../store/orderSelectors";

import type {
    Order,
    OrderStatus,
} from "../types/order.types";

import OrderStatusBadge from "./OrderStatusBadge";

/* ================================================================
   STATUS FILTERS
================================================================ */

const STATUS_FILTERS: {
    value: OrderStatus | "all";
    label: string;
}[] = [
        {
            value: "all",
            label: "All orders",
        },
        {
            value: "pending",
            label: "Pending",
        },
        {
            value: "confirmed",
            label: "Confirmed",
        },
        {
            value: "shipped",
            label: "Shipped",
        },
        {
            value: "delivered",
            label: "Delivered",
        },
        {
            value: "cancelled",
            label: "Cancelled",
        },
    ];

/* ================================================================
   PRICE
================================================================ */

function formatPrice(value: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
}

/* ================================================================
   DATE
================================================================ */

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

/* ================================================================
   STATUS THEME
================================================================ */

function getStatusTheme(
    status: OrderStatus | "all",
) {
    switch (status) {
        case "pending":
            return {
                icon: Clock3,
                dot: "bg-amber-500",
                iconBg: "bg-amber-500/10",
                iconText:
                    "text-amber-600 dark:text-amber-400",
                active:
                    "border-amber-500/30 bg-amber-500/5",
                border:
                    "border-amber-500/20",
                line:
                    "bg-amber-500/40",
            };

        case "confirmed":
            return {
                icon: CheckCircle2,
                dot: "bg-blue-500",
                iconBg: "bg-blue-500/10",
                iconText:
                    "text-blue-600 dark:text-blue-400",
                active:
                    "border-blue-500/30 bg-blue-500/5",
                border:
                    "border-blue-500/20",
                line:
                    "bg-blue-500/40",
            };

        case "shipped":
            return {
                icon: Truck,
                dot: "bg-violet-500",
                iconBg: "bg-violet-500/10",
                iconText:
                    "text-violet-600 dark:text-violet-400",
                active:
                    "border-violet-500/30 bg-violet-500/5",
                border:
                    "border-violet-500/20",
                line:
                    "bg-violet-500/40",
            };

        case "delivered":
            return {
                icon: Package,
                dot: "bg-emerald-500",
                iconBg: "bg-emerald-500/10",
                iconText:
                    "text-emerald-600 dark:text-emerald-400",
                active:
                    "border-emerald-500/30 bg-emerald-500/5",
                border:
                    "border-emerald-500/20",
                line:
                    "bg-emerald-500/40",
            };

        case "cancelled":
            return {
                icon: XCircle,
                dot: "bg-red-500",
                iconBg: "bg-red-500/10",
                iconText:
                    "text-red-600 dark:text-red-400",
                active:
                    "border-red-500/30 bg-red-500/5",
                border:
                    "border-red-500/20",
                line:
                    "bg-red-500/40",
            };

        default:
            return {
                icon: ShoppingBag,
                dot: "bg-slate-500",
                iconBg: "bg-slate-500/10",
                iconText:
                    "text-slate-600 dark:text-slate-400",
                active:
                    "border-default bg-surface",
                border:
                    "border-default",
                line:
                    "bg-default",
            };
    }
}

/* ================================================================
   MAIN
================================================================ */

export default function MyOrdersList() {
    const dispatch = useAppDispatch();

    const orders = useAppSelector(
        selectMyOrders,
    );

    const loading = useAppSelector(
        selectMyOrdersLoading,
    );

    const error = useAppSelector(
        selectOrderError,
    );

    const [statusFilter, setStatusFilter] =
        useState<OrderStatus | "all">(
            "all",
        );

    /* ------------------------------------------------------------
       FETCH ORDERS
    ------------------------------------------------------------ */

    useEffect(() => {
        dispatch(
            fetchMyOrders(
                statusFilter === "all"
                    ? undefined
                    : {
                        status: statusFilter,
                    },
            ),
        );
    }, [
        dispatch,
        statusFilter,
    ]);

    /* ------------------------------------------------------------
       COUNTS
    ------------------------------------------------------------ */

    const counts = useMemo(
        () => ({
            all: orders.length,

            pending: orders.filter(
                (order) =>
                    order.orderStatus ===
                    "pending",
            ).length,

            confirmed: orders.filter(
                (order) =>
                    order.orderStatus ===
                    "confirmed",
            ).length,

            shipped: orders.filter(
                (order) =>
                    order.orderStatus ===
                    "shipped",
            ).length,

            delivered: orders.filter(
                (order) =>
                    order.orderStatus ===
                    "delivered",
            ).length,

            cancelled: orders.filter(
                (order) =>
                    order.orderStatus ===
                    "cancelled",
            ).length,
        }),
        [orders],
    );

    return (
        <main className="min-h-screen bg-surface-muted/30">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <header className="mb-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
                                <ShoppingBag className="h-3.5 w-3.5" />
                                Your shopping
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                                My Orders
                            </h1>

                            <p className="mt-1.5 max-w-xl text-sm leading-6 text-secondary">
                                Track your purchases,
                                check delivery status
                                and view your order
                                history.
                            </p>
                        </div>

                        <Link
                            href="/products"
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                self-start
                                rounded-xl
                                bg-accent
                                px-4
                                py-2.5
                                text-sm
                                font-semibold
                                text-accent-foreground
                                transition-all
                                hover:-translate-y-0.5
                                hover:opacity-90
                                sm:self-auto
                            "
                        >
                            Continue shopping
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </header>

                {/* ==================================================
                    ORDER SUMMARY
                ================================================== */}

                <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    <OrderStat
                        label="Total orders"
                        value={counts.all}
                        status="all"
                        active={
                            statusFilter ===
                            "all"
                        }
                        onClick={() =>
                            setStatusFilter(
                                "all",
                            )
                        }
                    />

                    <OrderStat
                        label="Pending"
                        value={
                            counts.pending
                        }
                        status="pending"
                        active={
                            statusFilter ===
                            "pending"
                        }
                        onClick={() =>
                            setStatusFilter(
                                "pending",
                            )
                        }
                    />

                    <OrderStat
                        label="Confirmed"
                        value={
                            counts.confirmed
                        }
                        status="confirmed"
                        active={
                            statusFilter ===
                            "confirmed"
                        }
                        onClick={() =>
                            setStatusFilter(
                                "confirmed",
                            )
                        }
                    />

                    <OrderStat
                        label="On the way"
                        value={
                            counts.shipped
                        }
                        status="shipped"
                        active={
                            statusFilter ===
                            "shipped"
                        }
                        onClick={() =>
                            setStatusFilter(
                                "shipped",
                            )
                        }
                    />

                    <OrderStat
                        label="Delivered"
                        value={
                            counts.delivered
                        }
                        status="delivered"
                        active={
                            statusFilter ===
                            "delivered"
                        }
                        onClick={() =>
                            setStatusFilter(
                                "delivered",
                            )
                        }
                    />
                </div>

                {/* ==================================================
                    FILTERS
                ================================================== */}

                <div className="mb-6 overflow-hidden rounded-2xl border border-default bg-surface">
                    <div className="flex gap-1 overflow-x-auto p-2">
                        {STATUS_FILTERS.map(
                            (filter) => {
                                const active =
                                    statusFilter ===
                                    filter.value;

                                const count =
                                    counts[
                                    filter.value
                                    ];

                                const theme =
                                    getStatusTheme(
                                        filter.value,
                                    );

                                const Icon =
                                    theme.icon;

                                return (
                                    <button
                                        key={
                                            filter.value
                                        }
                                        type="button"
                                        onClick={() =>
                                            setStatusFilter(
                                                filter.value,
                                            )
                                        }
                                        className={`
                                            inline-flex
                                            shrink-0
                                            items-center
                                            gap-2
                                            rounded-xl
                                            px-3.5
                                            py-2.5
                                            text-xs
                                            font-semibold
                                            transition-all
                                            ${active
                                                ? `${theme.active} ${theme.iconText}`
                                                : "text-secondary hover:bg-surface-hover hover:text-primary"
                                            }
                                        `}
                                    >
                                        <Icon className="h-3.5 w-3.5" />

                                        {filter.label}

                                        <span
                                            className={`
                                                rounded-full
                                                px-1.5
                                                py-0.5
                                                text-[10px]
                                                ${active
                                                    ? `${theme.iconBg} ${theme.iconText}`
                                                    : "bg-surface-muted text-muted"
                                                }
                                            `}
                                        >
                                            {count}
                                        </span>
                                    </button>
                                );
                            },
                        )}
                    </div>
                </div>

                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3.5 text-sm text-red-600 dark:text-red-400">
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0" />

                        <div>
                            <p className="font-semibold">
                                Unable to load orders
                            </p>

                            <p className="mt-0.5">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {/* ==================================================
                    ORDERS
                ================================================== */}

                {loading ? (
                    <OrdersSkeleton />
                ) : orders.length === 0 ? (
                    <EmptyOrders
                        filtered={
                            statusFilter !==
                            "all"
                        }
                    />
                ) : (
                    <div className="space-y-4">
                        {orders.map(
                            (order) => (
                                <OrderCard
                                    key={
                                        order._id
                                    }
                                    order={
                                        order
                                    }
                                />
                            ),
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}

/* ================================================================
   ORDER STAT
================================================================ */

interface OrderStatProps {
    label: string;
    value: number;
    status: OrderStatus | "all";
    active: boolean;
    onClick: () => void;
}

function OrderStat({
    label,
    value,
    status,
    active,
    onClick,
}: OrderStatProps) {
    const theme =
        getStatusTheme(status);

    const Icon = theme.icon;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                rounded-2xl
                border
                p-4
                text-left
                transition-all
                ${active
                    ? `${theme.active} ring-1 ring-current/5`
                    : "border-default bg-surface hover:border-strong hover:bg-surface-hover"
                }
            `}
        >
            <div
                className={`
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    ${active
                        ? `${theme.iconBg} ${theme.iconText}`
                        : "bg-surface-muted text-secondary"
                    }
                `}
            >
                <Icon className="h-4 w-4" />
            </div>

            <p className="mt-4 text-2xl font-bold tracking-tight text-primary">
                {value}
            </p>

            <p className="mt-0.5 text-xs text-muted">
                {label}
            </p>
        </button>
    );
}

/* ================================================================
   ORDER CARD
================================================================ */

function OrderCard({
    order,
}: {
    order: Order;
}) {
    const shop =
        typeof order.shop ===
            "string"
            ? null
            : order.shop;

    const shopName =
        shop?.shopName ??
        "Marketplace order";

    const theme =
        getStatusTheme(
            order.orderStatus,
        );

    return (
        <Link
            href={`/buyer/orders/${order._id}`}
            className="
                group
                block
                overflow-hidden
                rounded-2xl
                border
                border-default
                bg-surface
                transition-all
                hover:-translate-y-0.5
                hover:border-strong
                hover:shadow-lg
                sm:rounded-3xl
            "
        >
            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex flex-col gap-4 border-b border-default px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <div
                        className={`
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            ${theme.iconBg}
                            ${theme.iconText}
                        `}
                    >
                        <ShoppingBag className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-primary">
                            {shopName}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
                            <span>
                                Order #
                                {order._id
                                    .slice(
                                        -8,
                                    )
                                    .toUpperCase()}
                            </span>

                            <span className="text-default">
                                ·
                            </span>

                            <span>
                                {formatDate(
                                    order.createdAt,
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                <OrderStatusBadge
                    status={
                        order.orderStatus
                    }
                />
            </div>

            {/* ==================================================
                BODY
            ================================================== */}

            <div className="px-4 py-5 sm:px-6 sm:py-6">
                <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">

                    {/* LEFT */}
                    <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-secondary">
                            <Package className="h-4 w-4 text-muted" />

                            <span>
                                {order.items.length}{" "}
                                {order.items.length ===
                                    1
                                    ? "item"
                                    : "items"}
                            </span>

                            <span className="text-default">
                                ·
                            </span>

                            <span>
                                {order.paymentMethod ===
                                    "cod"
                                    ? "Cash on delivery"
                                    : "Paid online"}
                            </span>
                        </div>

                        <OrderProgress
                            status={
                                order.orderStatus
                            }
                        />
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center justify-between gap-5 border-t border-default pt-4 md:min-w-[220px] md:flex-col md:items-end md:border-t-0 md:pt-0">
                        <div className="text-left md:text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                                Order total
                            </p>

                            <p className="mt-1 text-xl font-bold tracking-tight text-primary">
                                {formatPrice(
                                    order.grandTotal,
                                )}
                            </p>
                        </div>

                        <div
                            className={`
                                inline-flex
                                items-center
                                gap-1.5
                                text-xs
                                font-semibold
                                ${theme.iconText}
                                transition-transform
                                group-hover:translate-x-0.5
                            `}
                        >
                            View order
                            <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================================================
                SHIPPING INFO
            ================================================== */}

            {order.shipment.awbCode && (
                <div
                    className={`
                        flex
                        flex-wrap
                        items-center
                        gap-x-3
                        gap-y-1
                        border-t
                        ${theme.border}
                        ${theme.iconBg}
                        px-4
                        py-3
                        sm:px-6
                    `}
                >
                    <div
                        className={`flex items-center gap-2 text-xs ${theme.iconText}`}
                    >
                        <Truck className="h-3.5 w-3.5" />

                        <span>
                            Tracking:
                        </span>

                        <span className="font-semibold text-primary">
                            {
                                order
                                    .shipment
                                    .awbCode
                            }
                        </span>
                    </div>

                    {order.shipment
                        .courierName && (
                            <>
                                <span className="text-muted">
                                    ·
                                </span>

                                <span className="text-xs text-secondary">
                                    {
                                        order
                                            .shipment
                                            .courierName
                                    }
                                </span>
                            </>
                        )}
                </div>
            )}
        </Link>
    );
}

/* ================================================================
   ORDER PROGRESS
================================================================ */

function OrderProgress({
    status,
}: {
    status: OrderStatus;
}) {
    const theme =
        getStatusTheme(status);

    /* ------------------------------------------------------------
       CANCELLED
    ------------------------------------------------------------ */

    if (status === "cancelled") {
        return (
            <div
                className={`
                    mt-6
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    ${theme.border}
                    ${theme.iconBg}
                    px-3
                    py-2.5
                    text-xs
                    ${theme.iconText}
                `}
            >
                <XCircle className="h-4 w-4 shrink-0" />

                <span className="font-medium">
                    This order has been
                    cancelled.
                </span>
            </div>
        );
    }

    const steps = [
        {
            label: "Ordered",
            active: true,
        },
        {
            label: "Confirmed",
            active: [
                "confirmed",
                "shipped",
                "delivered",
            ].includes(status),
        },
        {
            label: "Shipped",
            active: [
                "shipped",
                "delivered",
            ].includes(status),
        },
        {
            label: "Delivered",
            active:
                status ===
                "delivered",
        },
    ];

    /*
     * Avoid Array.prototype.findLast()
     * so the component works with older
     * TypeScript lib targets as well.
     */
    let currentStep = steps[0];

    for (let i = steps.length - 1; i >= 0; i--) {
        if (steps[i].active) {
            currentStep = steps[i];
            break;
        }
    }

    return (
        <div className="mt-6">

            {/* Current status */}
            <div
                className={`
                    mb-4
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    ${theme.border}
                    ${theme.iconBg}
                    px-3
                    py-1.5
                    text-[10px]
                    font-semibold
                    ${theme.iconText}
                `}
            >
                <span
                    className={`
                        h-1.5
                        w-1.5
                        rounded-full
                        ${theme.dot}
                    `}
                />

                {getStatusLabel(status)}
            </div>

            {/* Timeline */}
            <div className="overflow-x-auto pb-1">
                <div className="flex min-w-[420px] items-start">
                    {steps.map(
                        (
                            step,
                            index,
                        ) => (
                            <div
                                key={
                                    step.label
                                }
                                className="flex min-w-0 flex-1 items-center"
                            >
                                <div className="flex min-w-0 items-center gap-2">
                                    <span
                                        className={`
                                            flex
                                            h-6
                                            w-6
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            ${step.active
                                                ? `${theme.dot} text-white`
                                                : "bg-surface-muted text-muted"
                                            }
                                        `}
                                    >
                                        {step.active ? (
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                        ) : (
                                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                        )}
                                    </span>

                                    <span
                                        className={`
                                            hidden
                                            truncate
                                            text-[10px]
                                            font-medium
                                            sm:block
                                            ${step.active
                                                ? "text-primary"
                                                : "text-muted"
                                            }
                                        `}
                                    >
                                        {
                                            step.label
                                        }
                                    </span>
                                </div>

                                {index <
                                    steps.length -
                                    1 && (
                                        <div
                                            className={`
                                            mx-2
                                            h-0.5
                                            flex-1
                                            rounded-full
                                            ${steps[
                                                    index +
                                                    1
                                                ]
                                                    .active
                                                    ? theme.line
                                                    : "bg-default"
                                                }
                                        `}
                                        />
                                    )}
                            </div>
                        ),
                    )}
                </div>
            </div>

            {/* Mobile status */}
            <p
                className={`mt-2 text-[10px] font-medium ${theme.iconText} sm:hidden`}
            >
                Current:
                {" "}
                {currentStep.label}
            </p>
        </div>
    );
}

/* ================================================================
   STATUS LABEL
================================================================ */

function getStatusLabel(
    status: OrderStatus,
): string {
    switch (status) {
        case "pending":
            return "Waiting for confirmation";

        case "confirmed":
            return "Order confirmed";

        case "shipped":
            return "On the way";

        case "delivered":
            return "Delivered successfully";

        case "cancelled":
            return "Order cancelled";

        default:
            return "Order status";
    }
}

/* ================================================================
   EMPTY
================================================================ */

function EmptyOrders({
    filtered,
}: {
    filtered: boolean;
}) {
    return (
        <div className="rounded-3xl border border-dashed border-default bg-surface px-6 py-16 text-center sm:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-muted">
                <ShoppingBag className="h-7 w-7 text-muted" />
            </div>

            <h2 className="mt-5 text-base font-bold text-primary">
                {filtered
                    ? "No orders in this category"
                    : "Your orders will appear here"}
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-secondary">
                {filtered
                    ? "Try another order status to find what you're looking for."
                    : "Once you place an order, you can track and manage it from here."}
            </p>

            {!filtered && (
                <Link
                    href="/products"
                    className="
                        mt-6
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-accent
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-accent-foreground
                        transition-all
                        hover:-translate-y-0.5
                        hover:opacity-90
                    "
                >
                    Start shopping
                    <ArrowRight className="h-4 w-4" />
                </Link>
            )}
        </div>
    );
}

/* ================================================================
   SKELETON
================================================================ */

function OrdersSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({
                length: 4,
            }).map((_, index) => (
                <div
                    key={index}
                    className="overflow-hidden rounded-3xl border border-default bg-surface"
                >
                    <div className="animate-pulse border-b border-default px-5 py-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-surface-muted" />

                            <div className="space-y-2">
                                <div className="h-3 w-32 rounded bg-surface-muted" />
                                <div className="h-2.5 w-48 rounded bg-surface-muted" />
                            </div>
                        </div>
                    </div>

                    <div className="animate-pulse space-y-5 px-5 py-6">
                        <div className="h-3 w-24 rounded bg-surface-muted" />
                        <div className="h-2.5 w-full rounded bg-surface-muted" />
                        <div className="h-2.5 w-3/4 rounded bg-surface-muted" />
                    </div>
                </div>
            ))}
        </div>
    );
}