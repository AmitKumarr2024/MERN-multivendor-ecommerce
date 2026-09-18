"use client";

import { useEffect, useMemo, useState } from "react";

import {
    CheckCircle2,
    ChevronRight,
    Clock3,
    Package,
    RefreshCw,
    Send,
    ShoppingBag,
    Truck,
    UserRound,
    XCircle,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
    fetchShopOrders,
    updateOrderStatus,
    shipOrder,
} from "../store/orderSlice";

import {
    selectMutatingOrderId,
    selectOrderError,
    selectShopOrders,
    selectShopOrdersLoading,
} from "../store/orderSelectors";

import type {
    Order,
    OrderStatus,
} from "../types/order.types";

import OrderStatusBadge from "./OrderStatusBadge";

const STATUS_FILTERS: {
    value: OrderStatus | "all";
    label: string;
}[] = [
        { value: "all", label: "All orders" },
        { value: "pending", label: "Pending" },
        { value: "confirmed", label: "Confirmed" },
        { value: "shipped", label: "Shipped" },
        { value: "delivered", label: "Delivered" },
        { value: "cancelled", label: "Cancelled" },
    ];

const NEXT_STATUS: Partial<
    Record<OrderStatus, OrderStatus>
> = {
    pending: "confirmed",
    confirmed: "shipped",
    shipped: "delivered",
};

export default function SellerOrdersList() {
    const dispatch = useAppDispatch();

    const orders = useAppSelector(selectShopOrders);
    const loading = useAppSelector(
        selectShopOrdersLoading,
    );
    const error = useAppSelector(selectOrderError);
    const mutatingId = useAppSelector(
        selectMutatingOrderId,
    );

    const [statusFilter, setStatusFilter] =
        useState<OrderStatus | "all">("all");

    useEffect(() => {
        dispatch(
            fetchShopOrders(
                statusFilter === "all"
                    ? undefined
                    : {
                        status: statusFilter,
                    },
            ),
        );
    }, [dispatch, statusFilter]);

    const handleAdvanceStatus = (
        order: Order,
    ) => {
        const next =
            NEXT_STATUS[order.orderStatus];

        if (!next) return;

        dispatch(
            updateOrderStatus({
                id: order._id,
                status: next,
            }),
        );
    };

    const handleShip = (
        order: Order,
    ) => {
        dispatch(
            shipOrder(order._id),
        );
    };
    const counts = useMemo(() => {
        return {
            all: orders.length,

            pending: orders.filter(
                (o) => o.orderStatus === "pending",
            ).length,

            confirmed: orders.filter(
                (o) => o.orderStatus === "confirmed",
            ).length,

            shipped: orders.filter(
                (o) => o.orderStatus === "shipped",
            ).length,

            delivered: orders.filter(
                (o) => o.orderStatus === "delivered",
            ).length,

            cancelled: orders.filter(
                (o) => o.orderStatus === "cancelled",
            ).length,
        };
    }, [orders]);

    return (
        <main className="min-h-screen bg-surface-muted/30">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <header className="mb-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
                                <ShoppingBag className="h-3.5 w-3.5" />
                                Seller center
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                                Orders
                            </h1>

                            <p className="mt-1.5 text-sm text-secondary">
                                Manage orders, shipping and
                                fulfillment from your shop.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                dispatch(
                                    fetchShopOrders(
                                        statusFilter ===
                                            "all"
                                            ? undefined
                                            : {
                                                status: statusFilter,
                                            },
                                    ),
                                )
                            }
                            disabled={loading}
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                self-start
                                rounded-xl
                                border
                                border-default
                                bg-surface
                                px-4
                                py-2.5
                                text-sm
                                font-medium
                                text-primary
                                transition-colors
                                hover:bg-surface-hover
                                disabled:opacity-50
                                sm:self-auto
                            "
                        >
                            <RefreshCw
                                className={`
                                    h-4 w-4
                                    ${loading
                                        ? "animate-spin"
                                        : ""
                                    }
                                `}
                            />

                            Refresh
                        </button>
                    </div>
                </header>

                {/* ==================================================
                    SUMMARY
                ================================================== */}

                <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    <SummaryCard
                        label="All orders"
                        value={counts.all}
                        icon={
                            <ShoppingBag className="h-4 w-4" />
                        }
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

                    <SummaryCard
                        label="Pending"
                        value={counts.pending}
                        icon={
                            <Clock3 className="h-4 w-4" />
                        }
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

                    <SummaryCard
                        label="Confirmed"
                        value={counts.confirmed}
                        icon={
                            <CheckCircle2 className="h-4 w-4" />
                        }
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

                    <SummaryCard
                        label="Shipped"
                        value={counts.shipped}
                        icon={
                            <Truck className="h-4 w-4" />
                        }
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

                    <SummaryCard
                        label="Delivered"
                        value={counts.delivered}
                        icon={
                            <Package className="h-4 w-4" />
                        }
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
                    FILTER BAR
                ================================================== */}

                <div className="mb-5 rounded-2xl border border-default bg-surface p-2">
                    <div className="flex gap-1 overflow-x-auto">
                        {STATUS_FILTERS.map(
                            (filter) => {
                                const active =
                                    statusFilter ===
                                    filter.value;

                                const count =
                                    filter.value ===
                                        "all"
                                        ? counts.all
                                        : counts[
                                        filter.value
                                        ] ?? 0;

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
                                            py-2
                                            text-xs
                                            font-semibold
                                            transition-all
                                            ${active
                                                ? "bg-primary text-surface shadow-sm"
                                                : "text-secondary hover:bg-surface-hover hover:text-primary"
                                            }
                                        `}
                                    >
                                        {
                                            filter.label
                                        }

                                        <span
                                            className={`
                                                rounded-full
                                                px-1.5
                                                py-0.5
                                                text-[10px]
                                                ${active
                                                    ? "bg-surface/15 text-surface"
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
                    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-danger-bg bg-danger-bg/50 px-4 py-3.5 text-sm text-danger-text">
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0" />

                        <div>
                            <p className="font-semibold">
                                Something went wrong
                            </p>

                            <p className="mt-0.5">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {/* ==================================================
                    CONTENT
                ================================================== */}

                {loading ? (
                    <OrdersSkeleton />
                ) : orders.length === 0 ? (
                    <EmptyOrders />
                ) : (
                    <>
                        {/* Desktop */}
                        <div className="hidden overflow-hidden rounded-2xl border border-default bg-surface lg:block">
                            <div className="grid grid-cols-[1.5fr_1fr_0.8fr_1fr_auto] gap-4 border-b border-default bg-surface-muted/50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
                                <span>Order</span>
                                <span>Customer</span>
                                <span>Total</span>
                                <span>Status</span>
                                <span className="text-right">
                                    Action
                                </span>
                            </div>

                            <div className="divide-y divide-default">
                                {orders.map(
                                    (order) => (
                                        <DesktopOrderRow
                                            key={
                                                order._id
                                            }
                                            order={
                                                order
                                            }
                                            busy={
                                                mutatingId ===
                                                order._id
                                            }
                                            onAdvanceStatus={() =>
                                                handleAdvanceStatus(
                                                    order,
                                                )
                                            }
                                            onShip={() =>
                                                handleShip(
                                                    order,
                                                )
                                            }
                                        />
                                    ),
                                )}
                            </div>
                        </div>

                        {/* Mobile / Tablet */}
                        <div className="space-y-3 lg:hidden">
                            {orders.map(
                                (order) => (
                                    <MobileOrderCard
                                        key={
                                            order._id
                                        }
                                        order={
                                            order
                                        }
                                        busy={
                                            mutatingId ===
                                            order._id
                                        }
                                        onAdvanceStatus={() =>
                                            handleAdvanceStatus(
                                                order,
                                            )
                                        }
                                        onShip={() =>
                                            handleShip(
                                                order,
                                            )
                                        }
                                    />
                                ),
                            )}
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}

/* ================================================================
   SUMMARY CARD
================================================================ */

interface SummaryCardProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    active: boolean;
    onClick: () => void;
}

function SummaryCard({
    label,
    value,
    icon,
    active,
    onClick,
}: SummaryCardProps) {
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
                    ? "border-accent/40 bg-accent/5 ring-1 ring-accent/10"
                    : "border-default bg-surface hover:border-strong hover:bg-surface-hover"
                }
            `}
        >
            <div className="flex items-center justify-between gap-2">
                <div
                    className={`
                        flex h-8 w-8
                        items-center justify-center
                        rounded-lg
                        ${active
                            ? "bg-accent text-accent-foreground"
                            : "bg-surface-muted text-secondary"
                        }
                    `}
                >
                    {icon}
                </div>

                <ChevronRight className="h-3.5 w-3.5 text-muted" />
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
   DESKTOP ROW
================================================================ */

interface OrderRowProps {
    order: Order;
    busy: boolean;
    onAdvanceStatus: () => void;
    onShip: () => void;
}

function DesktopOrderRow({
    order,
    busy,
    onAdvanceStatus,
    onShip,
}: OrderRowProps) {
    const buyer =
        typeof order.buyer === "string"
            ? null
            : order.buyer;

    const nextStatus =
        NEXT_STATUS[
        order.orderStatus
        ];

    const buyerName =
        buyer?.name ?? "Buyer";

    const initials =
        buyerName
            .charAt(0)
            .toUpperCase();

    return (
        <div className="grid grid-cols-[1.5fr_1fr_0.8fr_1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-hover">
            {/* Order */}
            <div className="min-w-0">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-xs font-bold text-secondary">
                        <ShoppingBag className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-primary">
                            #
                            {order._id
                                .slice(-8)
                                .toUpperCase()}
                        </p>

                        <p className="mt-0.5 text-xs text-muted">
                            {formatDate(
                                order.createdAt,
                            )}{" "}
                            ·{" "}
                            {order.items.length}{" "}
                            {order.items.length ===
                                1
                                ? "item"
                                : "items"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Customer */}
            <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[11px] font-bold text-accent">
                        {initials}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-primary">
                            {buyerName}
                        </p>

                        <p className="text-[11px] text-muted">
                            Customer
                        </p>
                    </div>
                </div>
            </div>

            {/* Total */}
            <div>
                <p className="text-sm font-bold text-primary">
                    ₹
                    {order.grandTotal.toLocaleString(
                        "en-IN",
                    )}
                </p>

                <p className="mt-0.5 text-[11px] text-muted">
                    {order.paymentMethod ===
                        "cod"
                        ? "Cash on delivery"
                        : "Paid online"}
                </p>
            </div>

            {/* Status */}
            <div>
                <OrderStatusBadge
                    status={
                        order.orderStatus
                    }
                />

                {order.shipment.awbCode && (
                    <p className="mt-1.5 text-[10px] text-muted">
                        AWB {order.shipment.awbCode}
                    </p>
                )}
            </div>

            {/* Action */}
            <OrderActions
                order={order}
                busy={busy}
                nextStatus={nextStatus}
                onAdvanceStatus={
                    onAdvanceStatus
                }
                onShip={onShip}
            />
        </div>
    );
}

/* ================================================================
   MOBILE CARD
================================================================ */

function MobileOrderCard({
    order,
    busy,
    onAdvanceStatus,
    onShip,
}: OrderRowProps) {
    const buyer =
        typeof order.buyer === "string"
            ? null
            : order.buyer;

    const nextStatus =
        NEXT_STATUS[
        order.orderStatus
        ];

    const buyerName =
        buyer?.name ?? "Buyer";

    return (
        <article className="overflow-hidden rounded-2xl border border-default bg-surface">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted">
                        <ShoppingBag className="h-4 w-4 text-secondary" />
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-primary">
                            #
                            {order._id
                                .slice(-8)
                                .toUpperCase()}
                        </p>

                        <p className="mt-0.5 text-xs text-muted">
                            {formatDate(
                                order.createdAt,
                            )}
                        </p>
                    </div>
                </div>

                <OrderStatusBadge
                    status={
                        order.orderStatus
                    }
                />
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 border-y border-default bg-surface-muted/30 px-4 py-4">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                        Customer
                    </p>

                    <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">
                            {buyerName
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <span className="truncate text-xs font-medium text-primary">
                            {buyerName}
                        </span>
                    </div>
                </div>

                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                        Order total
                    </p>

                    <p className="mt-2 text-sm font-bold text-primary">
                        ₹
                        {order.grandTotal.toLocaleString(
                            "en-IN",
                        )}
                    </p>

                    <p className="mt-0.5 text-[10px] text-muted">
                        {order.paymentMethod ===
                            "cod"
                            ? "Cash on delivery"
                            : "Paid online"}
                    </p>
                </div>
            </div>

            {/* Shipment */}
            {order.shipment.awbCode && (
                <div className="flex items-center gap-2 border-b border-default px-4 py-3">
                    <Truck className="h-3.5 w-3.5 text-accent" />

                    <p className="text-xs text-secondary">
                        AWB{" "}
                        <span className="font-semibold text-primary">
                            {
                                order
                                    .shipment
                                    .awbCode
                            }
                        </span>

                        <span className="mx-1.5 text-muted">
                            ·
                        </span>

                        {
                            order.shipment
                                .courierName
                        }
                    </p>
                </div>
            )}

            {/* Actions */}
            <div className="p-4">
                <OrderActions
                    order={order}
                    busy={busy}
                    nextStatus={nextStatus}
                    onAdvanceStatus={
                        onAdvanceStatus
                    }
                    onShip={onShip}
                    mobile
                />
            </div>
        </article>
    );
}

/* ================================================================
   ACTIONS
================================================================ */

interface OrderActionsProps {
    order: Order;
    busy: boolean;
    nextStatus?: OrderStatus;
    onAdvanceStatus: () => void;
    onShip: () => void;
    mobile?: boolean;
}

function OrderActions({
    order,
    busy,
    nextStatus,
    onAdvanceStatus,
    onShip,
    mobile = false,
}: OrderActionsProps) {
    const canShip =
        order.orderStatus ===
        "confirmed" &&
        !order.shipment.awbCode;

    const canSkipCourier =
        order.orderStatus ===
        "confirmed";

    if (
        !canShip &&
        !nextStatus &&
        !canSkipCourier
    ) {
        return (
            <span className="text-xs text-muted">
                No action required
            </span>
        );
    }

    return (
        <div
            className={`
                flex flex-wrap gap-2
                ${mobile
                    ? "w-full"
                    : "justify-end"
                }
            `}
        >
            {canShip && (
                <button
                    type="button"
                    onClick={onShip}
                    disabled={busy}
                    className="
                        inline-flex
                        items-center
                        justify-center
                        gap-1.5
                        rounded-lg
                        bg-accent
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        text-accent-foreground
                        transition-all
                        hover:opacity-90
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    <Send className="h-3.5 w-3.5" />

                    {busy
                        ? "Shipping..."
                        : "Ship order"}
                </button>
            )}

            {nextStatus &&
                order.orderStatus !==
                "confirmed" && (
                    <button
                        type="button"
                        onClick={
                            onAdvanceStatus
                        }
                        disabled={busy}
                        className="
                            inline-flex
                            items-center
                            justify-center
                            gap-1.5
                            rounded-lg
                            border
                            border-default
                            bg-surface
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-primary
                            transition-colors
                            hover:bg-surface-hover
                            disabled:opacity-50
                        "
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />

                        {busy
                            ? "Updating..."
                            : `Mark ${nextStatus}`}
                    </button>
                )}

            {canSkipCourier && (
                <button
                    type="button"
                    onClick={
                        onAdvanceStatus
                    }
                    disabled={busy}
                    className="
                        inline-flex
                        items-center
                        justify-center
                        gap-1.5
                        rounded-lg
                        border
                        border-default
                        bg-surface
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        text-secondary
                        transition-colors
                        hover:bg-surface-hover
                        disabled:opacity-50
                    "
                >
                    {busy
                        ? "Updating..."
                        : "Skip courier"}
                </button>
            )}
        </div>
    );
}

/* ================================================================
   EMPTY
================================================================ */

function EmptyOrders() {
    return (
        <div className="rounded-2xl border border-dashed border-default bg-surface px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted">
                <ShoppingBag className="h-5 w-5 text-muted" />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-primary">
                No orders found
            </h2>

            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-muted">
                Orders placed with your shop will
                appear here. Try another status filter
                if you're looking for a previous order.
            </p>
        </div>
    );
}

/* ================================================================
   LOADING
================================================================ */

function OrdersSkeleton() {
    return (
        <div className="space-y-3">
            <div className="hidden overflow-hidden rounded-2xl border border-default bg-surface lg:block">
                <div className="h-12 animate-pulse bg-surface-muted" />

                {Array.from({
                    length: 5,
                }).map((_, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-5 gap-4 border-t border-default px-5 py-5"
                    >
                        <SkeletonBlock />
                        <SkeletonBlock />
                        <SkeletonBlock />
                        <SkeletonBlock />
                        <SkeletonBlock />
                    </div>
                ))}
            </div>

            <div className="space-y-3 lg:hidden">
                {Array.from({
                    length: 4,
                }).map((_, index) => (
                    <div
                        key={index}
                        className="h-44 animate-pulse rounded-2xl border border-default bg-surface-muted"
                    />
                ))}
            </div>
        </div>
    );
}

function SkeletonBlock() {
    return (
        <div className="h-8 rounded-lg bg-surface-muted" />
    );
}

/* ================================================================
   DATE
================================================================ */

function formatDate(
    date: string,
) {
    return new Date(
        date,
    ).toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        },
    );
}