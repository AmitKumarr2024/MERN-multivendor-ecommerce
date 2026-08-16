"use client";

import { useEffect } from "react";
import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { fetchMyShop, selectMyShop, selectMyShopLoading, selectHasCheckedMyShop } from "@/features/shop";
import { fetchMyProducts, selectMyProducts, selectMyProductsLoading } from "@/features/products";
import { fetchShopOrders, selectShopOrders, selectShopOrdersLoading, selectShopOrderCounts } from "@/features/order";

export default function SellerDashboardOverview() {
    const dispatch = useAppDispatch();

    const shop = useAppSelector(selectMyShop);
    const shopLoading = useAppSelector(selectMyShopLoading);
    const hasCheckedShop = useAppSelector(selectHasCheckedMyShop);

    const products = useAppSelector(selectMyProducts);
    const productsLoading = useAppSelector(selectMyProductsLoading);

    const orders = useAppSelector(selectShopOrders);
    const ordersLoading = useAppSelector(selectShopOrdersLoading);
    const orderCounts = useAppSelector(selectShopOrderCounts);

    useEffect(() => {
        dispatch(fetchMyShop());
        dispatch(fetchMyProducts());
        dispatch(fetchShopOrders());
    }, [dispatch]);

    if (hasCheckedShop && !shop && !shopLoading) {
        return (

            <div className="mx-auto max-w-3xl p-4 sm:p-6">
                <div className="rounded-2xl border border-dashed border-default bg-surface p-10 text-center">
                    <p className="text-sm text-secondary">
                        You haven&apos;t set up your shop yet — the dashboard needs a
                        shop to show data for.
                    </p>
                    <Link
                        href="/seller/shop"
                        className="mt-3 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
                    >
                        Set up your shop
                    </Link>
                </div>
            </div>

        );
    }

    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const outOfStockCount = products.filter((p) => p.stock === 0).length;
    const recentOrders = orders.slice(0, 5);
    const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);
    const deliveredCount = orders.filter((o) => o.orderStatus === "delivered").length;
    const fulfillmentRate = orders.length > 0 ? Math.round((deliveredCount / orders.length) * 100) : 0;
    const activeProductsRate =
        products.length > 0 ? Math.round((products.filter((p) => p.isActive).length / products.length) * 100) : 0;

    return (

        <div className="mx-auto max-w-6xl space-y-5 p-4 pb-10 sm:space-y-6 sm:p-6">
            {/* Header */}
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-purple-400 text-sm font-bold text-accent-foreground shadow-sm sm:h-12 sm:w-12 sm:text-lg">
                    {(shop?.shopName ?? "D").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                    <h1 className="truncate text-lg font-semibold text-primary sm:text-2xl">
                        {shopLoading ? "Loading..." : `${shop?.shopName ?? "Dashboard"}`}
                        {!shopLoading && shop && <span className="ml-1 font-normal text-secondary">👋</span>}
                    </h1>
                    <p className="hidden text-sm text-secondary sm:block">
                        Here&apos;s what&apos;s happening with your shop today.
                    </p>
                </div>

                {shop && (
                    <span
                        className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${shop.isActive ? "bg-success-bg text-success-text" : "bg-surface-muted text-secondary"
                            }`}
                    >
                        <span className={`h-1.5 w-1.5 rounded-full ${shop.isActive ? "bg-success-text" : "bg-muted"}`} />
                        <span className="hidden sm:inline">{shop.isActive ? "Shop is live" : "Shop is hidden"}</span>
                    </span>
                )}
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard
                    label="Total revenue"
                    value={ordersLoading ? "…" : `₹${totalRevenue.toLocaleString("en-IN")}`}
                    href="/seller/orders"
                    icon={<RupeeIcon />}
                    featured
                />
                <StatCard
                    label="Products"
                    value={productsLoading ? "…" : products.length}
                    href="/seller/products"
                    icon={<BoxIcon />}
                />
                <StatCard
                    label="Low stock"
                    value={productsLoading ? "…" : lowStockCount}
                    href="/seller/products"
                    icon={<TrendDownIcon />}
                    tone={lowStockCount > 0 ? "warning" : undefined}
                />
                <StatCard
                    label="Out of stock"
                    value={productsLoading ? "…" : outOfStockCount}
                    href="/seller/products"
                    icon={<AlertIcon />}
                    tone={outOfStockCount > 0 ? "danger" : undefined}
                />
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                {/* Recent orders */}
                <div className="rounded-2xl border border-default bg-surface shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between border-b border-default px-4 py-4 sm:px-6">
                        <h2 className="text-base font-semibold text-primary">Recent orders</h2>
                        <Link href="/seller/orders" className="text-sm font-medium text-info-text hover:opacity-80">
                            View all →
                        </Link>
                    </div>

                    <div className="p-2 sm:p-3">
                        {ordersLoading ? (
                            <div className="space-y-2 p-2">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-muted" />
                                ))}
                            </div>
                        ) : recentOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <p className="text-sm text-muted">No orders yet.</p>
                            </div>
                        ) : (
                            <ul>
                                {recentOrders.map((order) => {
                                    const buyer = typeof order.buyer === "string" ? null : order.buyer;
                                    return (
                                        <li key={order._id}>
                                            <div className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm transition-colors hover:bg-surface-hover sm:px-3">
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-purple-300 text-xs font-bold text-accent-foreground">
                                                    {(buyer?.name ?? "B").charAt(0).toUpperCase()}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-semibold text-primary">
                                                        #{order._id.slice(-8).toUpperCase()} — {buyer?.name ?? "Buyer"}
                                                    </p>
                                                    <p className="text-xs text-muted">
                                                        {order.items.length} item{order.items.length !== 1 ? "s" : ""} · ₹
                                                        {order.grandTotal.toLocaleString("en-IN")}
                                                    </p>
                                                </div>
                                                <OrderStatusPill status={order.orderStatus} />
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Side column */}
                <div className="flex flex-col gap-5">
                    <div className="rounded-2xl border border-default bg-surface p-4 shadow-sm sm:p-5">
                        <h2 className="mb-3 text-base font-semibold text-primary">Quick actions</h2>
                        <div className="space-y-2">
                            <QuickAction href="/seller/products/new" label="Add product" icon={<PlusIcon />} />
                            <QuickAction href="/seller/orders" label="View orders" icon={<ListIcon />} />
                            <QuickAction href="/seller/shop" label="Edit shop" icon={<StoreIcon />} />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-default bg-surface p-4 shadow-sm sm:p-5">
                        <h2 className="mb-4 text-base font-semibold text-primary">Shop health</h2>
                        <div className="space-y-4">
                            <ProgressRow label="Products active" percent={activeProductsRate} barClassName="bg-success-text" />
                            <ProgressRow label="Order fulfillment" percent={fulfillmentRate} barClassName="bg-info-text" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}

interface StatCardProps {
    label: string;
    value: number | string;
    href: string;
    icon: React.ReactNode;
    tone?: "warning" | "danger";
    featured?: boolean;
}

function StatCard({ label, value, href, icon, tone, featured }: StatCardProps) {
    const toneText = tone === "warning" ? "text-warning-text" : tone === "danger" ? "text-danger-text" : "text-primary";
    const toneBg = tone === "warning" ? "bg-warning-bg" : tone === "danger" ? "bg-danger-bg" : "bg-surface-muted";
    const iconText = tone === "warning" ? "text-warning-text" : tone === "danger" ? "text-danger-text" : "text-secondary";

    return (
        <Link
            href={href}
            className={`flex flex-col gap-3 rounded-2xl border p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md sm:p-5 ${featured ? "border-accent/30 bg-gradient-to-br from-accent/10 via-surface to-surface" : "border-default bg-surface"
                }`}
        >
            <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${featured ? "bg-accent text-accent-foreground" : `${toneBg} ${iconText}`
                    }`}
            >
                {icon}
            </span>
            <div>
                <p className={`text-2xl font-extrabold tracking-tight ${featured ? "text-accent" : toneText}`}>
                    {value}
                </p>
                <p className="mt-0.5 text-xs font-medium text-secondary">{label}</p>
            </div>
        </Link>
    );
}

function QuickAction({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-2.5 rounded-xl border border-default px-3.5 py-2.5 text-sm font-medium text-primary transition-colors hover:border-strong hover:bg-surface-hover"
        >
            <span className="text-secondary">{icon}</span>
            {label}
        </Link>
    );
}

function ProgressRow({
    label,
    percent,
    barClassName,
}: {
    label: string;
    percent: number;
    barClassName: string;
}) {
    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-secondary">{label}</span>
                <span className="font-bold text-primary">{percent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${barClassName}`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}

function OrderStatusPill({ status }: { status: string }) {
    const tones: Record<string, string> = {
        pending: "bg-warning-bg text-warning-text",
        confirmed: "bg-info-bg text-info-text",
        shipped: "bg-info-bg text-info-text",
        delivered: "bg-success-bg text-success-text",
        cancelled: "bg-danger-bg text-danger-text",
    };
    const cls = tones[status] ?? "bg-surface-muted text-secondary";
    return (
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${cls}`}>
            {status}
        </span>
    );
}

/* ---------- icons ---------- */

function RupeeIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M6 5h8M6 8h8M6 5c3 0 5 1 5 3.5S9 12 6 12l6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function BoxIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M3 6.5l7-3.5 7 3.5-7 3.5-7-3.5zm0 0v7l7 3.5m0-10.5v10.5m7-10.5v7l-7 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function TrendDownIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M3 6l5 5 3-3 6 6M13 14h4v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function AlertIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M10 3l8 14H2L10 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M10 8v3.5M10 14.2v.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}

function ListIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M4 6h12M4 10h12M4 14h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}

function StoreIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M3 8l1-4h12l1 4M3 8v7a1 1 0 001 1h3v-5h6v5h3a1 1 0 001-1V8M3 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}