"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
    ArrowRight,
    AlertTriangle,
    BarChart3,
    Box,
    ChevronRight,
    CircleDollarSign,
    ClipboardList,
    Package,
    Plus,
    ShoppingBag,
    Store,
    TrendingDown,
    TrendingUp,
    Users
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
    fetchMyShop,
    selectMyShop,
    selectMyShopLoading,
    selectHasCheckedMyShop,
} from "@/features/shop";

import {
    fetchMyProducts,
    selectMyProducts,
    selectMyProductsLoading,
} from "@/features/products";

import {
    fetchShopOrders,
    selectShopOrders,
    selectShopOrdersLoading,
} from "@/features/order";
import { StaffRosterCard } from "@/features/staff";


export default function SellerDashboardOverview() {
    const dispatch = useAppDispatch();

    const shop = useAppSelector(selectMyShop);
    const shopLoading = useAppSelector(selectMyShopLoading);
    const hasCheckedShop = useAppSelector(selectHasCheckedMyShop);

    const products = useAppSelector(selectMyProducts);
    const productsLoading = useAppSelector(
        selectMyProductsLoading,
    );

    const orders = useAppSelector(selectShopOrders);
    const ordersLoading = useAppSelector(
        selectShopOrdersLoading,
    );

    useEffect(() => {
        dispatch(fetchMyShop());
        dispatch(fetchMyProducts());
        dispatch(fetchShopOrders());
    }, [dispatch]);

    if (
        hasCheckedShop &&
        !shop &&
        !shopLoading
    ) {
        return <ShopSetupState />;
    }

    const lowStockCount = products.filter(
        (product) =>
            product.stock > 0 &&
            product.stock <= 5,
    ).length;

    const outOfStockCount = products.filter(
        (product) => product.stock === 0,
    ).length;

    const activeProducts = products.filter(
        (product) => product.isActive,
    ).length;

    const recentOrders = orders.slice(0, 5);

    const totalRevenue = orders.reduce(
        (sum, order) =>
            sum + order.grandTotal,
        0,
    );

    const deliveredCount = orders.filter(
        (order) =>
            order.orderStatus === "delivered",
    ).length;

    const fulfillmentRate =
        orders.length > 0
            ? Math.round(
                (deliveredCount /
                    orders.length) *
                100,
            )
            : 0;

    const activeProductsRate =
        products.length > 0
            ? Math.round(
                (activeProducts /
                    products.length) *
                100,
            )
            : 0;

    const pendingOrders = orders.filter(
        (order) =>
            order.orderStatus === "pending",
    ).length;

    return (
        <div className="min-h-full">
            <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 pb-10 sm:px-6 sm:py-7 lg:px-8">

                {/* =====================================================
                    HEADER
                ===================================================== */}

                <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3.5">
                        <div
                            className="
                                flex
                                h-12
                                w-12
                                shrink-0
                                items-center
                                justify-center
                                rounded-2xl
                                bg-linear-to-br
                                from-accent
                                to-purple-500
                                text-lg
                                font-black
                                text-accent-foreground
                                shadow-lg
                                shadow-accent/20
                            "
                        >
                            {(shop?.shopName ?? "S")
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="truncate text-xl font-bold tracking-tight text-primary sm:text-2xl">
                                    {shopLoading
                                        ? "Loading shop..."
                                        : shop?.shopName ??
                                        "Seller Dashboard"}
                                </h1>

                                {shop && (
                                    <span
                                        className={`
                                            hidden
                                            items-center
                                            gap-1.5
                                            rounded-full
                                            px-2.5
                                            py-1
                                            text-[11px]
                                            font-semibold
                                            sm:inline-flex
                                            ${shop.isActive
                                                ? "bg-success-bg text-success-text"
                                                : "bg-surface-muted text-secondary"
                                            }
                                        `}
                                    >
                                        <span
                                            className={`
                                                h-1.5
                                                w-1.5
                                                rounded-full
                                                ${shop.isActive
                                                    ? "bg-success-text"
                                                    : "bg-muted"
                                                }
                                            `}
                                        />

                                        {shop.isActive
                                            ? "Live"
                                            : "Hidden"}
                                    </span>
                                )}
                            </div>

                            <p className="mt-1 text-xs text-secondary sm:text-sm">
                                Here's what's happening with
                                your shop today.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            href="/seller/products/new"
                            className="
                                inline-flex
                                flex-1
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-accent
                                px-4
                                py-2.5
                                text-sm
                                font-semibold
                                text-accent-foreground
                                shadow-sm
                                transition-all
                                hover:-translate-y-0.5
                                hover:opacity-90
                                sm:flex-none
                            "
                        >
                            <Plus className="h-4 w-4" />
                            Add product
                        </Link>

                        <Link
                            href="/seller/shop"
                            className="
                                hidden
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                border
                                border-default
                                bg-surface
                                px-4
                                py-2.5
                                text-sm
                                font-semibold
                                text-primary
                                transition-colors
                                hover:bg-surface-hover
                                sm:inline-flex
                            "
                        >
                            <Store className="h-4 w-4" />
                            Shop
                        </Link>
                    </div>
                </header>

                {/* =====================================================
                    KPI GRID
                ===================================================== */}

                <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <MetricCard
                        label="Revenue"
                        value={
                            ordersLoading
                                ? "..."
                                : `₹${totalRevenue.toLocaleString(
                                    "en-IN",
                                )}`
                        }
                        description="From current orders"
                        icon={
                            <CircleDollarSign className="h-5 w-5" />
                        }
                        featured
                    />

                    <MetricCard
                        label="Products"
                        value={
                            productsLoading
                                ? "..."
                                : products.length
                        }
                        description={`${activeProducts} active`}
                        icon={
                            <Package className="h-5 w-5" />
                        }
                    />

                    <MetricCard
                        label="Low stock"
                        value={
                            productsLoading
                                ? "..."
                                : lowStockCount
                        }
                        description={
                            lowStockCount > 0
                                ? "Needs attention"
                                : "Inventory healthy"
                        }
                        icon={
                            <TrendingDown className="h-5 w-5" />
                        }
                        tone={
                            lowStockCount > 0
                                ? "warning"
                                : "success"
                        }
                    />

                    <MetricCard
                        label="Out of stock"
                        value={
                            productsLoading
                                ? "..."
                                : outOfStockCount
                        }
                        description={
                            outOfStockCount > 0
                                ? "Restock required"
                                : "All products stocked"
                        }
                        icon={
                            <AlertTriangle className="h-5 w-5" />
                        }
                        tone={
                            outOfStockCount > 0
                                ? "danger"
                                : "success"
                        }
                    />
                </section>

                {/* =====================================================
                    MAIN CONTENT
                ===================================================== */}

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">

                    {/* =================================================
                        ORDERS
                    ================================================= */}

                    <section
                        className="
                            min-w-0
                            overflow-hidden
                            rounded-3xl
                            border
                            border-default
                            bg-surface
                        "
                    >
                        <div className="flex items-center justify-between border-b border-default px-5 py-4 sm:px-6">
                            <div>
                                <h2 className="text-base font-bold text-primary">
                                    Recent orders
                                </h2>

                                <p className="mt-0.5 text-xs text-muted">
                                    Latest activity from your shop
                                </p>
                            </div>

                            <Link
                                href="/seller/orders"
                                className="
                                    inline-flex
                                    items-center
                                    gap-1
                                    text-xs
                                    font-semibold
                                    text-info-text
                                    hover:opacity-80
                                    sm:text-sm
                                "
                            >
                                View all
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>

                        {/* Pending banner */}
                        {pendingOrders > 0 && (
                            <div className="mx-4 mt-4 flex items-center gap-3 rounded-2xl border border-warning-text/20 bg-warning-bg px-4 py-3 sm:mx-5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface">
                                    <ClipboardList className="h-4 w-4 text-warning-text" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-primary">
                                        {pendingOrders} order
                                        {pendingOrders !== 1
                                            ? "s"
                                            : ""}{" "}
                                        waiting for action
                                    </p>

                                    <p className="mt-0.5 text-[11px] text-secondary">
                                        Review and confirm your
                                        pending orders.
                                    </p>
                                </div>

                                <Link
                                    href="/seller/orders"
                                    className="shrink-0 text-xs font-bold text-warning-text"
                                >
                                    Review
                                </Link>
                            </div>
                        )}

                        <div className="p-3 sm:p-4">
                            {ordersLoading ? (
                                <OrderSkeleton />
                            ) : recentOrders.length === 0 ? (
                                <EmptyOrders />
                            ) : (
                                <div className="space-y-1">
                                    {recentOrders.map(
                                        (order) => {
                                            const buyer =
                                                typeof order.buyer ===
                                                    "string"
                                                    ? null
                                                    : order.buyer;

                                            return (
                                                <Link
                                                    key={
                                                        order._id
                                                    }
                                                    href="/seller/orders"
                                                    className="
                                                        group
                                                        flex
                                                        items-center
                                                        gap-3
                                                        rounded-2xl
                                                        p-3
                                                        transition-colors
                                                        hover:bg-surface-hover
                                                    "
                                                >
                                                    <div
                                                        className="
                                                            flex
                                                            h-10
                                                            w-10
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-xl
                                                            bg-surface-muted
                                                            text-xs
                                                            font-bold
                                                            text-secondary
                                                        "
                                                    >
                                                        {(
                                                            buyer?.name ??
                                                            "B"
                                                        )
                                                            .charAt(
                                                                0,
                                                            )
                                                            .toUpperCase()}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-semibold text-primary">
                                                            #
                                                            {order._id
                                                                .slice(
                                                                    -8,
                                                                )
                                                                .toUpperCase()}
                                                        </p>

                                                        <p className="mt-0.5 truncate text-xs text-muted">
                                                            {buyer?.name ??
                                                                "Buyer"}{" "}
                                                            ·{" "}
                                                            {
                                                                order
                                                                    .items
                                                                    .length
                                                            }{" "}
                                                            item
                                                            {order
                                                                .items
                                                                .length !==
                                                                1
                                                                ? "s"
                                                                : ""}
                                                        </p>
                                                    </div>

                                                    <div className="hidden text-right sm:block">
                                                        <p className="text-sm font-bold text-primary">
                                                            ₹
                                                            {order.grandTotal.toLocaleString(
                                                                "en-IN",
                                                            )}
                                                        </p>
                                                    </div>

                                                    <StatusPill
                                                        status={
                                                            order.orderStatus
                                                        }
                                                    />

                                                    <ChevronRight className="hidden h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 sm:block" />
                                                </Link>
                                            );
                                        },
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* =================================================
                        SIDEBAR
                    ================================================= */}

                    <aside className="space-y-6">

                        {/* Quick actions */}
                        <section className="overflow-hidden rounded-3xl border border-default bg-surface">
                            <div className="border-b border-default px-5 py-4">
                                <h2 className="text-base font-bold text-primary">
                                    Quick actions
                                </h2>

                                <p className="mt-0.5 text-xs text-muted">
                                    Manage your store faster.
                                </p>
                            </div>

                            <div className="grid gap-1 p-3">
                                <DashboardAction
                                    href="/seller/products/new"
                                    label="Add new product"
                                    description="List something new"
                                    icon={
                                        <Plus className="h-4 w-4" />
                                    }
                                />

                                <DashboardAction
                                    href="/seller/orders"
                                    label="Manage orders"
                                    description="Review customer orders"
                                    icon={
                                        <ClipboardList className="h-4 w-4" />
                                    }
                                />

                                <DashboardAction
                                    href="/seller/products"
                                    label="Manage inventory"
                                    description="Update products & stock"
                                    icon={
                                        <Box className="h-4 w-4" />
                                    }
                                />

                                <DashboardAction
                                    href="/seller/shop"
                                    label="Manage team"
                                    description="Staff, attendance & ratings"
                                    icon={<Users className="h-4 w-4" />}
                                />
                                <DashboardAction
                                    href="/seller/shop"
                                    label="Edit shop"
                                    description="Update storefront"
                                    icon={
                                        <Store className="h-4 w-4" />
                                    }
                                />
                            </div>
                        </section>

                        {/* Today's roster — NEW */}
                        {shop && <StaffRosterCard shopId={shop._id} />}

                        {/* Shop health */}
                        <section className="overflow-hidden rounded-3xl border border-default bg-surface">
                            <div className="border-b border-default px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success-bg text-success-text">
                                        <BarChart3 className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-bold text-primary">
                                            Shop health
                                        </h2>

                                        <p className="text-[11px] text-muted">
                                            Store performance overview
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5 p-5">
                                <HealthProgress
                                    label="Active products"
                                    value={
                                        activeProductsRate
                                    }
                                    icon={
                                        <ShoppingBag className="h-3.5 w-3.5" />
                                    }
                                />

                                <HealthProgress
                                    label="Order fulfillment"
                                    value={
                                        fulfillmentRate
                                    }
                                    icon={
                                        <TrendingUp className="h-3.5 w-3.5" />
                                    }
                                />
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   METRIC CARD
========================================================= */

interface MetricCardProps {
    label: string;
    value: number | string;
    description: string;
    icon: React.ReactNode;
    featured?: boolean;
    tone?: "warning" | "danger" | "success";
}

function MetricCard({
    label,
    value,
    description,
    icon,
    featured,
    tone,
}: MetricCardProps) {
    const iconClasses = featured
        ? "bg-accent text-accent-foreground"
        : tone === "warning"
            ? "bg-warning-bg text-warning-text"
            : tone === "danger"
                ? "bg-danger-bg text-danger-text"
                : tone === "success"
                    ? "bg-success-bg text-success-text"
                    : "bg-surface-muted text-secondary";

    const valueClasses = featured
        ? "text-accent"
        : tone === "warning"
            ? "text-warning-text"
            : tone === "danger"
                ? "text-danger-text"
                : "text-primary";

    return (
        <div
            className={`
                rounded-2xl
                border
                p-4
                transition-all
                hover:-translate-y-0.5
                hover:shadow-md
                sm:rounded-3xl
                sm:p-5
                ${featured
                    ? "border-accent/20 bg-linear-to-br from-accent/10 via-surface to-surface"
                    : "border-default bg-surface"
                }
            `}
        >
            <div className="flex items-start justify-between gap-3">
                <div
                    className={`
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        sm:h-10
                        sm:w-10
                        ${iconClasses}
                    `}
                >
                    {icon}
                </div>
            </div>

            <div className="mt-4">
                <p
                    className={`text-xl font-black tracking-tight sm:text-2xl ${valueClasses}`}
                >
                    {value}
                </p>

                <p className="mt-0.5 text-xs font-semibold text-primary">
                    {label}
                </p>

                <p className="mt-1 hidden text-[11px] text-muted sm:block">
                    {description}
                </p>
            </div>
        </div>
    );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function DashboardAction({
    href,
    label,
    description,
    icon,
}: {
    href: string;
    label: string;
    description: string;
    icon: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="
                group
                flex
                items-center
                gap-3
                rounded-2xl
                p-3
                transition-colors
                hover:bg-surface-hover
            "
        >
            <div
                className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-surface-muted
                    text-secondary
                    transition-colors
                    group-hover:bg-accent/10
                    group-hover:text-accent
                "
            >
                {icon}
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-primary">
                    {label}
                </p>

                <p className="truncate text-[11px] text-muted">
                    {description}
                </p>
            </div>

            <ArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
        </Link>
    );
}

/* =========================================================
   HEALTH
========================================================= */

function HealthProgress({
    label,
    value,
    icon,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
}) {
    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
                    {icon}
                    {label}
                </div>

                <span className="text-xs font-bold text-primary">
                    {value}%
                </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                <div
                    className="h-full rounded-full bg-linear-to-r from-accent to-purple-500 transition-all duration-700"
                    style={{
                        width: `${value}%`,
                    }}
                />
            </div>
        </div>
    );
}

/* =========================================================
   STATUS
========================================================= */

function StatusPill({
    status,
}: {
    status: string;
}) {
    const tones: Record<string, string> = {
        pending:
            "bg-warning-bg text-warning-text",
        confirmed:
            "bg-info-bg text-info-text",
        shipped:
            "bg-info-bg text-info-text",
        delivered:
            "bg-success-bg text-success-text",
        cancelled:
            "bg-danger-bg text-danger-text",
    };

    return (
        <span
            className={`
                shrink-0
                rounded-full
                px-2
                py-1
                text-[10px]
                font-bold
                capitalize
                sm:px-2.5
                sm:text-xs
                ${tones[status] ?? "bg-surface-muted text-secondary"}
            `}
        >
            {status}
        </span>
    );
}

/* =========================================================
   LOADING
========================================================= */

function OrderSkeleton() {
    return (
        <div className="space-y-2 p-2">
            {Array.from({
                length: 5,
            }).map((_, index) => (
                <div
                    key={index}
                    className="h-[60px] animate-pulse rounded-2xl bg-surface-muted"
                />
            ))}
        </div>
    );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyOrders() {
    return (
        <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-muted">
                <ShoppingBag className="h-5 w-5" />
            </div>

            <p className="mt-4 text-sm font-bold text-primary">
                No orders yet
            </p>

            <p className="mt-1 max-w-xs text-xs text-muted">
                Orders from your customers will appear here.
            </p>
        </div>
    );
}

/* =========================================================
   SHOP SETUP
========================================================= */

function ShopSetupState() {
    return (
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-8 sm:px-6">
            <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-default bg-surface">
                <div className="bg-linear-to-br from-accent/10 via-surface to-purple-500/10 px-6 py-8 text-center sm:px-10 sm:py-12">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg shadow-accent/20">
                        <Store className="h-6 w-6" />
                    </div>

                    <h1 className="mt-5 text-xl font-black tracking-tight text-primary sm:text-2xl">
                        Set up your shop
                    </h1>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-secondary">
                        Create your storefront before accessing
                        your seller dashboard and managing
                        products.
                    </p>

                    <Link
                        href="/seller/shop"
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
                            font-bold
                            text-accent-foreground
                            transition-all
                            hover:-translate-y-0.5
                            hover:opacity-90
                        "
                    >
                        Set up my shop
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}