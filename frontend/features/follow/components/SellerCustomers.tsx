"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search, Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchShopCustomers } from "../store/followSlice";
import { selectFollowError, selectFollowLoading, selectShopCustomers } from "../store/followSelectors";
import type { CustomerSegment } from "../types/follow.types";

type Tab = CustomerSegment | "all";

const TABS: { value: Tab; label: string }[] = [
    { value: "all", label: "All" },
    { value: "new", label: "New" },
    { value: "returning", label: "Returning" },
    { value: "regular", label: "Regular" },
];

const BADGE: Record<CustomerSegment, string> = {
    new: "bg-info-bg text-info-text",
    returning: "bg-warning-bg text-warning-text",
    regular: "bg-success-bg text-success-text",
};

const date = (v: string) => new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function SellerCustomers({ shopId }: { shopId: string }) {
    const dispatch = useAppDispatch();
    const data = useAppSelector(selectShopCustomers);
    const loading = useAppSelector(selectFollowLoading);
    const error = useAppSelector(selectFollowError);

    const [tab, setTab] = useState<Tab>("all");
    const [search, setSearch] = useState("");
    const [debounced, setDebounced] = useState("");
    const [sort, setSort] = useState<"lastOrder" | "orders" | "spent" | "firstOrder">("lastOrder");
    const [page, setPage] = useState(1);

    useEffect(() => {
        const t = setTimeout(() => {
            setDebounced(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        dispatch(fetchShopCustomers({ shopId, segment: tab, search: debounced, sort, page }));
    }, [dispatch, shopId, tab, debounced, sort, page]);

    const s = data?.summary;
    const count = (t: Tab) => (!s ? 0 : t === "all" ? s.total : s[t]);

    return (
        <div className="space-y-5">
            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <Users className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-primary">Customers</h2>
                    <p className="text-sm text-secondary">Visible only to you. Based on real order history, not on who follows.</p>
                </div>
            </div>

            {s && (
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <Stat label="Customers" value={s.total} />
                    <Stat label="Regular" value={s.regular} />
                    <Stat label="Followers" value={s.followers} />
                    <Stat label="Revenue" value={`₹${s.totalRevenue.toLocaleString("en-IN")}`} />
                </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2 overflow-x-auto">
                    {TABS.map((t) => (
                        <button
                            key={t.value}
                            type="button"
                            onClick={() => {
                                setTab(t.value);
                                setPage(1);
                            }}
                            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${tab === t.value ? "bg-accent text-accent-foreground" : "bg-surface-muted text-secondary hover:bg-surface-hover"
                                }`}
                        >
                            {t.label} <span className="opacity-70">{count(t.value)}</span>
                        </button>
                    ))}
                </div>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as typeof sort)}
                    className="rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary"
                >
                    <option value="lastOrder">Latest order</option>
                    <option value="orders">Most orders</option>
                    <option value="spent">Highest spend</option>
                    <option value="firstOrder">Oldest customers</option>
                </select>
            </div>

            <div className="relative sm:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name or email"
                    className="w-full rounded-xl border border-default bg-surface py-2 pl-9 pr-3 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none"
                />
            </div>

            {error && <div className="rounded-lg bg-danger-bg px-4 py-3 text-sm text-danger-text">{error}</div>}

            {loading && !data ? (
                <div className="h-48 animate-pulse rounded-2xl bg-surface-muted" />
            ) : !data || data.items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-default bg-surface py-14 text-center text-sm text-secondary">
                    No customers here yet. Customers appear after their first non-cancelled order.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-default bg-surface">
                    <table className="w-full min-w-[820px] text-sm">
                        <thead>
                            <tr className="border-b border-default bg-surface-muted/50 text-left text-xs font-semibold text-muted">
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Segment</th>
                                <th className="px-4 py-3">Orders</th>
                                <th className="px-4 py-3">Total spent</th>
                                <th className="px-4 py-3">First order</th>
                                <th className="px-4 py-3">Last order</th>
                                <th className="px-4 py-3">Last activity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-default">
                            {data.items.map((c) => (
                                <tr key={c.buyerId} className="hover:bg-surface-hover">
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-primary">{c.name}</p>
                                        <p className="text-xs text-muted">
                                            {c.email}
                                            {c.isFollower && " · follower"}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${BADGE[c.segment]}`}>{c.segment}</span>
                                    </td>
                                    <td className="px-4 py-3 text-primary">{c.orderCount}</td>
                                    <td className="px-4 py-3 text-primary">₹{c.totalSpent.toLocaleString("en-IN")}</td>
                                    <td className="px-4 py-3 text-secondary">{date(c.firstOrderAt)}</td>
                                    <td className="px-4 py-3 text-secondary">{date(c.lastOrderAt)}</td>
                                    <td className="px-4 py-3 text-secondary">{date(c.lastActivityAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {data && data.pages > 1 && (
                <div className="flex items-center justify-center gap-3 text-sm text-secondary">
                    <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-default p-2 disabled:opacity-40" aria-label="Previous page">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    Page {data.page} of {data.pages}
                    <button type="button" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-default p-2 disabled:opacity-40" aria-label="Next page">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}

            {data && (
                <p className="text-xs text-muted">
                    <strong>Regular</strong> = {data.rules.REGULAR_MIN_ORDERS}+ orders in the last {data.rules.WINDOW_DAYS} days, at least {data.rules.REGULAR_MIN_DELIVERED} delivered.{" "}
                    <strong>Returning</strong> = 2+ orders. <strong>New</strong> = 1 order. Cancelled orders are ignored.
                </p>
            )}
        </div>
    );
}

function Stat({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="rounded-2xl border border-default bg-surface p-4">
            <p className="text-xl font-bold text-primary">{value}</p>
            <p className="text-xs text-muted">{label}</p>
        </div>
    );
}