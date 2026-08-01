"use client";

import { useEffect } from "react";
import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { fetchMyShop, selectMyShop, selectMyShopLoading, selectHasCheckedMyShop } from "@/features/shop";
import { fetchMyProducts, selectMyProducts, selectMyProductsLoading } from "@/features/products";
import { fetchShopOrders, selectShopOrders, selectShopOrdersLoading, selectShopOrderCounts } from "@/features/order";

/**
 * This IS the seller dashboard — there's no separate backend
 * "dashboard" endpoint, so this screen is built by combining
 * three existing endpoints:
 *   - GET /api/shops/me      (shop status)
 *   - GET /api/products/me   (product stats)
 *   - GET /api/orders/shop   (order counts, recent orders)
 *
 * No revenue charts / analytics here on purpose — that data
 * doesn't exist on the backend yet (see PROJECT_HANDOFF.md,
 * "defer until real users ask" tier). Adding fake numbers
 * here would be worse than not having them.
 */
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
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
                    <p className="text-sm text-gray-600">
                        You haven&apos;t set up your shop yet — the dashboard needs a
                        shop to show data for.
                    </p>
                    <Link
                        href="/seller/shop"
                        className="mt-3 inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
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

    return (
        <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                        {shopLoading ? "Loading..." : shop?.shopName ?? "Dashboard"}
                    </h1>
                    <p className="text-sm text-gray-500">Here&apos;s what&apos;s happening with your shop.</p>
                </div>

                {shop && (
                    <span
                        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${shop.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                            }`}
                    >
                        <span className={`h-1.5 w-1.5 rounded-full ${shop.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                        {shop.isActive ? "Shop is live" : "Shop is hidden"}
                    </span>
                )}
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                <StatCard
                    label="Products"
                    value={productsLoading ? "…" : products.length}
                    href="/seller/products"
                />
                <StatCard
                    label="Pending orders"
                    value={ordersLoading ? "…" : orderCounts.pending}
                    href="/seller/orders"
                    accent={orderCounts.pending > 0 ? "amber" : undefined}
                />
                <StatCard
                    label="Low stock"
                    value={productsLoading ? "…" : lowStockCount}
                    href="/seller/products"
                    accent={lowStockCount > 0 ? "amber" : undefined}
                />
                <StatCard
                    label="Out of stock"
                    value={productsLoading ? "…" : outOfStockCount}
                    href="/seller/products"
                    accent={outOfStockCount > 0 ? "red" : undefined}
                />
            </div>

            {/* Recent orders */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-900">Recent orders</h2>
                    <Link href="/seller/orders" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        View all →
                    </Link>
                </div>

                {ordersLoading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-50" />
                        ))}
                    </div>
                ) : recentOrders.length === 0 ? (
                    <p className="text-sm text-gray-400">No orders yet.</p>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {recentOrders.map((order) => {
                            const buyer = typeof order.buyer === "string" ? null : order.buyer;
                            return (
                                <li key={order._id} className="flex items-center justify-between py-2.5 text-sm">
                                    <div className="min-w-0">
                                        <p className="truncate font-medium text-gray-900">
                                            #{order._id.slice(-8).toUpperCase()} — {buyer?.name ?? "Buyer"}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {order.items.length} item{order.items.length !== 1 ? "s" : ""} · ₹
                                            {order.grandTotal.toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-xs font-medium capitalize text-gray-500">
                                        {order.orderStatus}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <QuickAction href="/seller/products/new" label="Add product" />
                <QuickAction href="/seller/orders" label="View orders" />
                <QuickAction href="/seller/shop" label="Edit shop" />
            </div>
        </div>
    );
}

interface StatCardProps {
    label: string;
    value: number | string;
    href: string;
    accent?: "amber" | "red";
}

function StatCard({ label, value, href, accent }: StatCardProps) {
    return (
        <Link
            href={href}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
            <p
                className={`text-2xl font-bold ${accent === "amber" ? "text-amber-600" : accent === "red" ? "text-red-600" : "text-gray-900"
                    }`}
            >
                {value}
            </p>
            <p className="mt-1 text-xs font-medium text-gray-500">{label}</p>
        </Link>
    );
}

function QuickAction({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
            {label}
        </Link>
    );
}