"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    CreditCard,
    MapPin,
    Package,
    Phone,
    ReceiptText,
    ShoppingBag,
    Truck,
    XCircle,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
    fetchOrderById,
    cancelMyOrder,
    clearCurrentOrder,
} from "../store/orderSlice";

import {
    selectCurrentOrder,
    selectOrderLoading,
    selectMutatingOrderId,
} from "../store/orderSelectors";

import { OrderTracking } from "@/features/logistics";

import OrderStatusBadge from "./OrderStatusBadge";

import type { OrderStatus } from "../types/order.types";

interface OrderDetailProps {
    orderId: string;
}

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
        month: "long",
        year: "numeric",
    });
}

/* ================================================================
   ORDER STATUS THEME
================================================================ */

function getOrderStatusTheme(status: OrderStatus) {
    switch (status) {
        case "pending":
            return {
                accent: "bg-amber-500",
                accentText:
                    "text-amber-600 dark:text-amber-400",
                soft: "bg-amber-500/10",
                border: "border-amber-500/20",
                line: "bg-amber-500/40",
                label: "Waiting for confirmation",
            };

        case "confirmed":
            return {
                accent: "bg-blue-500",
                accentText:
                    "text-blue-600 dark:text-blue-400",
                soft: "bg-blue-500/10",
                border: "border-blue-500/20",
                line: "bg-blue-500/40",
                label: "Order confirmed",
            };

        case "shipped":
            return {
                accent: "bg-violet-500",
                accentText:
                    "text-violet-600 dark:text-violet-400",
                soft: "bg-violet-500/10",
                border: "border-violet-500/20",
                line: "bg-violet-500/40",
                label: "On the way",
            };

        case "delivered":
            return {
                accent: "bg-emerald-500",
                accentText:
                    "text-emerald-600 dark:text-emerald-400",
                soft: "bg-emerald-500/10",
                border: "border-emerald-500/20",
                line: "bg-emerald-500/40",
                label: "Delivered successfully",
            };

        case "cancelled":
            return {
                accent: "bg-red-500",
                accentText:
                    "text-red-600 dark:text-red-400",
                soft: "bg-red-500/10",
                border: "border-red-500/20",
                line: "bg-red-500/40",
                label: "Order cancelled",
            };

        default:
            return {
                accent: "bg-slate-500",
                accentText:
                    "text-slate-600 dark:text-slate-400",
                soft: "bg-slate-500/10",
                border: "border-slate-500/20",
                line: "bg-slate-500/40",
                label: "Order status",
            };
    }
}

/* ================================================================
   MAIN
================================================================ */

export default function OrderDetail({
    orderId,
}: OrderDetailProps) {
    const dispatch = useAppDispatch();

    const order = useAppSelector(
        selectCurrentOrder,
    );

    const loading = useAppSelector(
        selectOrderLoading,
    );

    const mutatingId = useAppSelector(
        selectMutatingOrderId,
    );

    useEffect(() => {
        dispatch(fetchOrderById(orderId));

        return () => {
            dispatch(clearCurrentOrder());
        };
    }, [dispatch, orderId]);

    if (loading || !order) {
        return <OrderDetailSkeleton />;
    }

    const shop =
        typeof order.shop === "string"
            ? null
            : order.shop;

    const canCancel =
        order.orderStatus === "pending" ||
        order.orderStatus === "confirmed";

    const busy =
        mutatingId === order._id;

    const statusTheme =
        getOrderStatusTheme(
            order.orderStatus,
        );

    const handleCancel = () => {
        dispatch(
            cancelMyOrder({
                id: order._id,
            }),
        );
    };

    return (
        <main className="min-h-screen bg-surface-muted/30">
            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">

                {/* ==================================================
                    BACK
                ================================================== */}

                <Link
                    href="/buyer/orders"
                    className="
                        mb-5
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        font-medium
                        text-secondary
                        transition-colors
                        hover:text-primary
                    "
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to orders
                </Link>

                {/* ==================================================
                    ORDER HERO
                ================================================== */}

                <section className="overflow-hidden rounded-3xl border border-default bg-surface">
                    <div className="relative overflow-hidden px-5 py-6 sm:px-7 sm:py-8 lg:px-9">
                        {/* Decorative background */}
                        <div
                            className={`
                                pointer-events-none
                                absolute
                                -right-20
                                -top-20
                                h-64
                                w-64
                                rounded-full
                                ${statusTheme.soft}
                                opacity-60
                                blur-3xl
                            `}
                        />

                        <div className="relative">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                                {/* Order information */}
                                <div className="min-w-0">
                                    <div
                                        className={`
                                            mb-3
                                            inline-flex
                                            items-center
                                            gap-2
                                            rounded-full
                                            border
                                            ${statusTheme.border}
                                            ${statusTheme.soft}
                                            px-3
                                            py-1
                                            text-[11px]
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            ${statusTheme.accentText}
                                        `}
                                    >
                                        <span
                                            className={`
                                                h-1.5
                                                w-1.5
                                                rounded-full
                                                ${statusTheme.accent}
                                            `}
                                        />

                                        {statusTheme.label}
                                    </div>

                                    <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                                        Order #
                                        {order._id
                                            .slice(-8)
                                            .toUpperCase()}
                                    </h1>

                                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-secondary">
                                        <span className="inline-flex items-center gap-1.5">
                                            <CalendarDays className="h-3.5 w-3.5 text-muted" />

                                            Placed{" "}
                                            {formatDate(
                                                order.createdAt,
                                            )}
                                        </span>

                                        <span className="text-muted">
                                            ·
                                        </span>

                                        <span className="truncate">
                                            {shop?.shopName ??
                                                "Marketplace order"}
                                        </span>
                                    </div>
                                </div>

                                {/* Status badge */}
                                <OrderStatusBadge
                                    status={
                                        order.orderStatus
                                    }
                                />
                            </div>

                            {/* Delivery progress */}
                            <OrderTimeline
                                status={
                                    order.orderStatus
                                }
                            />
                        </div>
                    </div>

                    {/* ==================================================
                        CANCELLED NOTICE
                    ================================================== */}

                    {order.cancelReason && (
                        <div className="flex items-start gap-3 border-t border-red-500/20 bg-red-500/5 px-5 py-4 sm:px-7">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                                <XCircle className="h-4 w-4 text-red-500" />
                            </div>

                            <div>
                                <p className="text-xs font-bold text-red-600 dark:text-red-400">
                                    Order cancelled
                                </p>

                                <p className="mt-1 text-xs leading-5 text-secondary">
                                    {
                                        order.cancelReason
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </section>

                {/* ==================================================
                    MAIN CONTENT
                ================================================== */}

                <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_350px]">

                    {/* ==================================================
                        LEFT COLUMN
                    ================================================== */}

                    <div className="min-w-0 space-y-5">

                        {/* ==================================================
                            PRODUCTS
                        ================================================== */}

                        <section className="overflow-hidden rounded-3xl border border-default bg-surface">
                            <div className="flex items-center justify-between border-b border-default px-5 py-4 sm:px-6">
                                <div>
                                    <h2 className="text-sm font-bold text-primary">
                                        Items in this order
                                    </h2>

                                    <p className="mt-0.5 text-xs text-muted">
                                        {
                                            order.items.length
                                        }{" "}
                                        {order.items.length ===
                                            1
                                            ? "item"
                                            : "items"}
                                    </p>
                                </div>

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-muted">
                                    <Package className="h-4 w-4 text-secondary" />
                                </div>
                            </div>

                            <div className="divide-y divide-default">
                                {order.items.map(
                                    (item) => (
                                        <div
                                            key={
                                                item.product
                                            }
                                            className="
                                                flex
                                                gap-3
                                                px-4
                                                py-4
                                                sm:gap-4
                                                sm:px-6
                                                sm:py-5
                                            "
                                        >
                                            {/* Product image */}
                                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-surface-muted sm:h-24 sm:w-24">
                                                {item.image ? (
                                                    <Image
                                                        src={
                                                            item.image
                                                        }
                                                        alt={
                                                            item.name
                                                        }
                                                        fill
                                                        sizes="(max-width: 640px) 80px, 96px"
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <ShoppingBag className="h-6 w-6 text-muted" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product info */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                                                    <div className="min-w-0">
                                                        <h3 className="line-clamp-2 text-sm font-semibold text-primary sm:text-base">
                                                            {
                                                                item.name
                                                            }
                                                        </h3>

                                                        <p className="mt-1 text-xs text-muted">
                                                            Qty{" "}
                                                            {
                                                                item.quantity
                                                            }{" "}
                                                            ×{" "}
                                                            {formatPrice(
                                                                item.unitPrice,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <p className="shrink-0 text-sm font-bold text-primary sm:text-base">
                                                        {formatPrice(
                                                            item.subtotal,
                                                        )}
                                                    </p>
                                                </div>

                                                {/* Status */}
                                                <OrderItemStatus
                                                    status={
                                                        order.orderStatus
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </section>

                        {/* ==================================================
                            DELIVERY ADDRESS
                        ================================================== */}

                        <section className="overflow-hidden rounded-3xl border border-default bg-surface">
                            <div className="border-b border-default px-5 py-4 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                                        <MapPin className="h-4 w-4 text-accent" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-bold text-primary">
                                            Delivery address
                                        </h2>

                                        <p className="mt-0.5 text-xs text-muted">
                                            Where your order will be delivered
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-5 py-5 sm:px-6">
                                <div className="rounded-2xl bg-surface-muted/50 p-4">
                                    {order.shippingAddress
                                        .fullName && (
                                            <p className="text-sm font-semibold text-primary">
                                                {
                                                    order
                                                        .shippingAddress
                                                        .fullName
                                                }
                                            </p>
                                        )}

                                    <p className="mt-2 text-sm leading-6 text-secondary">
                                        {
                                            order
                                                .shippingAddress
                                                .street
                                        }
                                        ,{" "}
                                        {
                                            order
                                                .shippingAddress
                                                .city
                                        }
                                        {order.shippingAddress
                                            .state
                                            ? `, ${order.shippingAddress.state}`
                                            : ""}{" "}
                                        {
                                            order
                                                .shippingAddress
                                                .pincode
                                        }
                                    </p>

                                    {order.shippingAddress
                                        .phone && (
                                            <div className="mt-3 flex items-center gap-2 text-xs text-secondary">
                                                <Phone className="h-3.5 w-3.5 text-muted" />

                                                {
                                                    order
                                                        .shippingAddress
                                                        .phone
                                                }
                                            </div>
                                        )}
                                </div>
                            </div>
                        </section>

                        {/* ==================================================
                            TRACKING
                        ================================================== */}

                        <section className="overflow-hidden rounded-3xl border border-default bg-surface">
                            <div className="border-b border-default px-5 py-4 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`
                                            flex
                                            h-9
                                            w-9
                                            items-center
                                            justify-center
                                            rounded-xl
                                            ${statusTheme.soft}
                                        `}
                                    >
                                        <Truck
                                            className={`h-4 w-4 ${statusTheme.accentText}`}
                                        />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-bold text-primary">
                                            Delivery tracking
                                        </h2>

                                        <p className="mt-0.5 text-xs text-muted">
                                            Track the progress of your shipment
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6">
                                <OrderTracking
                                    orderId={
                                        order._id
                                    }
                                />
                            </div>
                        </section>
                    </div>

                    {/* ==================================================
                        RIGHT COLUMN
                    ================================================== */}

                    <aside className="lg:sticky lg:top-24 lg:self-start">
                        <div className="space-y-5">

                            {/* ==================================================
                                ORDER SUMMARY
                            ================================================== */}

                            <section className="overflow-hidden rounded-3xl border border-default bg-surface">
                                <div className="border-b border-default px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-muted">
                                            <ReceiptText className="h-4 w-4 text-secondary" />
                                        </div>

                                        <div>
                                            <h2 className="text-sm font-bold text-primary">
                                                Order summary
                                            </h2>

                                            <p className="mt-0.5 text-xs text-muted">
                                                Payment details
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 px-5 py-5">
                                    <PriceRow
                                        label="Subtotal"
                                        value={formatPrice(
                                            order.itemsSubtotal,
                                        )}
                                    />

                                    {order.shippingCost >
                                        0 && (
                                            <PriceRow
                                                label="Shipping"
                                                value={formatPrice(
                                                    order.shippingCost,
                                                )}
                                            />
                                        )}

                                    {order.discount >
                                        0 && (
                                            <PriceRow
                                                label="Discount"
                                                value={`-${formatPrice(
                                                    order.discount,
                                                )}`}
                                                positive
                                            />
                                        )}

                                    <div className="border-t border-default pt-4">
                                        <div className="flex items-end justify-between gap-4">
                                            <div>
                                                <p className="text-xs text-muted">
                                                    Total
                                                </p>

                                                <p className="mt-1 text-2xl font-bold tracking-tight text-primary">
                                                    {formatPrice(
                                                        order.grandTotal,
                                                    )}
                                                </p>
                                            </div>

                                            <div
                                                className={`
                                                    flex
                                                    h-9
                                                    w-9
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    ${statusTheme.soft}
                                                `}
                                            >
                                                <CreditCard
                                                    className={`h-4 w-4 ${statusTheme.accentText}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between rounded-xl bg-surface-muted/50 px-3 py-2.5">
                                        <span className="text-xs text-muted">
                                            Payment method
                                        </span>

                                        <span className="text-xs font-semibold text-primary">
                                            {order.paymentMethod === "cod"
                                                ? "Cash on delivery"
                                                : "Khata (Credit)"}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* ==================================================
                                SELLER
                            ================================================== */}

                            <section className="rounded-3xl border border-default bg-surface p-5">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                                    Seller
                                </p>

                                <div className="mt-3 flex items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-foreground">
                                        {(
                                            shop?.shopName ??
                                            "S"
                                        )
                                            .charAt(
                                                0,
                                            )
                                            .toUpperCase()}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-primary">
                                            {shop?.shopName ??
                                                "Marketplace seller"}
                                        </p>

                                        <p className="mt-0.5 text-xs text-muted">
                                            Your order seller
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* ==================================================
                                CANCEL ORDER
                            ================================================== */}

                            {canCancel && (
                                <section className="rounded-3xl border border-red-500/20 bg-red-500/[0.04] p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                                            <XCircle className="h-4 w-4 text-red-500" />
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-bold text-primary">
                                                Need to cancel this order?
                                            </h3>

                                            <p className="mt-1 text-xs leading-5 text-secondary">
                                                You can cancel this order while it is still being processed.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            handleCancel
                                        }
                                        disabled={
                                            busy
                                        }
                                        className="
                                            mt-4
                                            w-full
                                            rounded-xl
                                            border
                                            border-red-500/20
                                            bg-red-500/10
                                            px-4
                                            py-2.5
                                            text-xs
                                            font-bold
                                            text-red-600
                                            transition-all
                                            hover:bg-red-500
                                            hover:text-white
                                            dark:text-red-400
                                            dark:hover:text-white
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                                    >
                                        {busy
                                            ? "Cancelling order..."
                                            : "Cancel order"}
                                    </button>
                                </section>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}

/* ================================================================
   PRICE ROW
================================================================ */

function PriceRow({
    label,
    value,
    positive = false,
}: {
    label: string;
    value: string;
    positive?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-secondary">
                {label}
            </span>

            <span
                className={
                    positive
                        ? "font-medium text-emerald-600 dark:text-emerald-400"
                        : "font-medium text-primary"
                }
            >
                {value}
            </span>
        </div>
    );
}

/* ================================================================
   ORDER TIMELINE
================================================================ */

function OrderTimeline({
    status,
}: {
    status: OrderStatus;
}) {
    const theme =
        getOrderStatusTheme(status);

    /* ------------------------------------------------------------
       CANCELLED
    ------------------------------------------------------------ */

    if (status === "cancelled") {
        return (
            <div
                className={`
                    mt-8
                    flex
                    items-start
                    gap-3
                    rounded-2xl
                    border
                    ${theme.border}
                    ${theme.soft}
                    px-4
                    py-4
                `}
            >
                <div
                    className={`
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        ${theme.accent}
                        text-white
                    `}
                >
                    <XCircle className="h-4 w-4" />
                </div>

                <div>
                    <p
                        className={`text-sm font-bold ${theme.accentText}`}
                    >
                        Order cancelled
                    </p>

                    <p className="mt-1 text-xs leading-5 text-secondary">
                        This order is no longer being processed.
                    </p>
                </div>
            </div>
        );
    }

    /* ------------------------------------------------------------
       STEPS
    ------------------------------------------------------------ */

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
                status === "delivered",
        },
    ];

    return (
        <div className="mt-8">

            {/* Current status */}
            <div
                className={`
                    mb-5
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    ${theme.border}
                    ${theme.soft}
                    px-3
                    py-1.5
                `}
            >
                <span
                    className={`
                        h-2
                        w-2
                        rounded-full
                        ${theme.accent}
                    `}
                />

                <span
                    className={`text-xs font-semibold ${theme.accentText}`}
                >
                    {theme.label}
                </span>
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
                                className="flex flex-1 items-start"
                            >
                                <div className="flex min-w-0 flex-col items-center">
                                    <div
                                        className={`
                                            flex
                                            h-9
                                            w-9
                                            items-center
                                            justify-center
                                            rounded-full
                                            transition-all
                                            ${step.active
                                                ? `${theme.accent} text-white shadow-sm`
                                                : "bg-surface-muted text-muted"
                                            }
                                        `}
                                    >
                                        {step.active ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <Clock3 className="h-4 w-4" />
                                        )}
                                    </div>

                                    <span
                                        className={`
                                            mt-2
                                            text-[10px]
                                            font-semibold
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

                                {index < steps.length -
                                    1 && (
                                        <div
                                            className={`
                                            mt-[18px]
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
        </div>
    );
}

/* ================================================================
   PRODUCT ITEM STATUS
================================================================ */

function OrderItemStatus({
    status,
}: {
    status: OrderStatus;
}) {
    const theme =
        getOrderStatusTheme(status);

    switch (status) {
        case "pending":
            return (
                <div
                    className={`
                        mt-3
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        ${theme.border}
                        ${theme.soft}
                        px-2.5
                        py-1
                        text-[10px]
                        font-semibold
                        ${theme.accentText}
                    `}
                >
                    <Clock3 className="h-3 w-3" />
                    Awaiting confirmation
                </div>
            );

        case "confirmed":
            return (
                <div
                    className={`
                        mt-3
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        ${theme.border}
                        ${theme.soft}
                        px-2.5
                        py-1
                        text-[10px]
                        font-semibold
                        ${theme.accentText}
                    `}
                >
                    <CheckCircle2 className="h-3 w-3" />
                    Order confirmed
                </div>
            );

        case "shipped":
            return (
                <div
                    className={`
                        mt-3
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        ${theme.border}
                        ${theme.soft}
                        px-2.5
                        py-1
                        text-[10px]
                        font-semibold
                        ${theme.accentText}
                    `}
                >
                    <Truck className="h-3 w-3" />
                    On the way
                </div>
            );

        case "delivered":
            return (
                <div
                    className={`
                        mt-3
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        ${theme.border}
                        ${theme.soft}
                        px-2.5
                        py-1
                        text-[10px]
                        font-semibold
                        ${theme.accentText}
                    `}
                >
                    <CheckCircle2 className="h-3 w-3" />
                    Delivered
                </div>
            );

        case "cancelled":
            return (
                <div
                    className={`
                        mt-3
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        ${theme.border}
                        ${theme.soft}
                        px-2.5
                        py-1
                        text-[10px]
                        font-semibold
                        ${theme.accentText}
                    `}
                >
                    <XCircle className="h-3 w-3" />
                    Cancelled
                </div>
            );

        default:
            return null;
    }
}

/* ================================================================
   SKELETON
================================================================ */

function OrderDetailSkeleton() {
    return (
        <main className="min-h-screen bg-surface-muted/30">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="space-y-5">
                    <div className="h-5 w-28 animate-pulse rounded bg-surface-muted" />

                    <div className="h-64 animate-pulse rounded-3xl bg-surface-muted" />

                    <div className="grid gap-5 lg:grid-cols-[1fr_350px]">
                        <div className="space-y-5">
                            <div className="h-72 animate-pulse rounded-3xl bg-surface-muted" />

                            <div className="h-48 animate-pulse rounded-3xl bg-surface-muted" />

                            <div className="h-56 animate-pulse rounded-3xl bg-surface-muted" />
                        </div>

                        <div className="space-y-5">
                            <div className="h-80 animate-pulse rounded-3xl bg-surface-muted" />

                            <div className="h-28 animate-pulse rounded-3xl bg-surface-muted" />

                            <div className="h-36 animate-pulse rounded-3xl bg-surface-muted" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}