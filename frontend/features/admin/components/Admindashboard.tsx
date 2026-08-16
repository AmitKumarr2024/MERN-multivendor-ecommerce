"use client";

import { useEffect } from "react";
import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDashboardStats } from "../store/Adminslice";
import {
    selectDashboardStats,
    selectStatsLoading,
} from "../store/Adminselectors";

function formatPrice(value: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
}

export default function AdminDashboard() {
    const dispatch = useAppDispatch();

    const stats = useAppSelector(selectDashboardStats);
    const loading = useAppSelector(selectStatsLoading);

    useEffect(() => {
        dispatch(fetchDashboardStats());
    }, [dispatch]);

    return (

        <div className="mx-auto max-w-6xl space-y-5 p-4 pb-10 sm:space-y-6 sm:p-6">
            {/* Header */}
            <div>
                <h1 className="text-lg font-semibold text-primary sm:text-2xl">
                    Platform overview
                </h1>
                <p className="text-sm text-secondary">
                    Real-time counts across the marketplace.
                </p>
            </div>

            {loading || !stats ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-muted" />
                    ))}
                </div>
            ) : (
                <>
                    {/* Main stat cards */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                        <StatCard
                            label="Total revenue"
                            value={formatPrice(stats.revenue)}
                            href="/admin/orders"
                            icon={<RupeeIcon />}
                            featured
                        />
                        <StatCard
                            label="Total users"
                            value={stats.users.total}
                            href="/admin/users"
                            icon={<UsersIcon />}
                        />
                        <StatCard
                            label="Total shops"
                            value={stats.shops.total}
                            href="/admin/shops"
                            icon={<StoreIcon />}
                        />
                        <StatCard
                            label="Total products"
                            value={stats.products.total}
                            href="/admin/products"
                            icon={<BoxIcon />}
                        />
                    </div>

                    {/* Category management */}
                    <Link
                        href="/admin/categories"
                        className="group flex items-center justify-between gap-4 rounded-2xl border border-default bg-surface p-5 transition hover:-translate-y-0.5 hover:bg-surface-hover hover:shadow-md"
                    >
                        <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-info-bg text-info-text">
                                <TagIcon />
                            </span>
                            <div>
                                <p className="text-xs font-medium text-secondary">
                                    Marketplace structure
                                </p>
                                <h2 className="mt-0.5 text-base font-semibold text-primary sm:text-lg">
                                    Category Management
                                </h2>
                                <p className="mt-1 hidden text-sm text-secondary sm:block">
                                    Create, edit, activate, deactivate, and organize product categories.
                                </p>
                            </div>
                        </div>

                        <span className="shrink-0 rounded-lg bg-info-bg px-3 py-2 text-sm font-medium text-info-text transition group-hover:opacity-80">
                            Manage
                        </span>
                    </Link>

                    {/* Users / Shops / Products */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Section title="Users" icon={<UsersIcon />}>
                            <Row label="Buyers" value={stats.users.buyers} />
                            <Row label="Sellers" value={stats.users.sellers} />
                        </Section>

                        <Section title="Shops" icon={<StoreIcon />}>
                            <Row label="Verified" value={stats.shops.verified} tone="success" />
                            <Row label="Unverified" value={stats.shops.total - stats.shops.verified} tone="warning" />
                        </Section>

                        <Section title="Products" icon={<BoxIcon />}>
                            <Row label="Active" value={stats.products.active} tone="success" />
                            <Row label="Inactive" value={stats.products.total - stats.products.active} />
                        </Section>
                    </div>

                    {/* Orders */}
                    <Section title="Orders" icon={<ClipboardIcon />}>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <Row label="Total" value={stats.orders.total} />
                            <Row label="Pending" value={stats.orders.pending} tone="warning" />
                            <Row label="Delivered" value={stats.orders.delivered} tone="success" />
                            <Row label="Cancelled" value={stats.orders.cancelled} tone="danger" />
                        </div>
                    </Section>
                </>
            )}
        </div>

    );
}

/* ---------- Stat card ---------- */

function StatCard({
    label,
    value,
    href,
    icon,
    featured,
}: {
    label: string;
    value: string | number;
    href: string;
    icon: React.ReactNode;
    featured?: boolean;
}) {
    return (
        <Link
            href={href}
            className={`group rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${featured ? "border-accent/20 bg-accent/5" : "border-default bg-surface hover:bg-surface-hover"
                }`}
        >
            <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${featured ? "bg-accent text-accent-foreground" : "bg-surface-muted text-secondary"
                    }`}
            >
                {icon}
            </span>
            <p className={`mt-3 font-bold ${featured ? "text-2xl text-accent" : "text-2xl text-primary"}`}>
                {value}
            </p>
            <p className="mt-0.5 text-xs font-medium text-secondary">{label}</p>
            <p className="mt-2 text-xs font-medium text-secondary opacity-0 transition group-hover:opacity-100">
                View details →
            </p>
        </Link>
    );
}

/* ---------- Section ---------- */

function Section({
    title,
    icon,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-default bg-surface p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary">
                {icon && <span className="text-secondary">{icon}</span>}
                {title}
            </h2>
            <div className="space-y-3">{children}</div>
        </section>
    );
}

/* ---------- Row ---------- */

function Row({
    label,
    value,
    tone,
}: {
    label: string;
    value: number;
    tone?: "warning" | "success" | "danger";
}) {
    const color =
        tone === "warning"
            ? "text-warning-text"
            : tone === "success"
                ? "text-success-text"
                : tone === "danger"
                    ? "text-danger-text"
                    : "text-primary";

    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-secondary">{label}</span>
            <span className={`font-semibold ${color}`}>{value}</span>
        </div>
    );
}

/* ---------- icons ---------- */

function RupeeIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M6 5h8M6 8h8M6 5c3 0 5 1 5 3.5S9 12 6 12l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2.5 16c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4M13 7a2.2 2.2 0 100-4.4M17.5 16c0-2-1.5-3.5-3.5-3.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

function BoxIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M3 6.5l7-3.5 7 3.5-7 3.5-7-3.5zm0 0v7l7 3.5m0-10.5v10.5m7-10.5v7l-7 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
    );
}

function TagIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M4 4h6l6 6-6 6-6-6V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="7" cy="7" r="1" fill="currentColor" />
        </svg>
    );
}

function ClipboardIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <rect x="4" y="3" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 3V2h6v1M7 9h6M7 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}