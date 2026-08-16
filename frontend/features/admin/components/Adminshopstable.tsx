"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchShopsAdmin, verifyShopAdmin, toggleShopActiveAdmin } from "../store/Adminslice";
import {
    selectAdminError,
    selectAdminMutatingId,
    selectAdminShops,
    selectShopsLoading,
    selectShopsPage,
    selectShopsPages,
    selectShopsTotal,
} from "../store/Adminselectors";

export default function AdminShopsTable() {
    const dispatch = useAppDispatch();

    const shops = useAppSelector(selectAdminShops);
    const total = useAppSelector(selectShopsTotal);
    const page = useAppSelector(selectShopsPage);
    const pages = useAppSelector(selectShopsPages);
    const loading = useAppSelector(selectShopsLoading);
    const error = useAppSelector(selectAdminError);
    const mutatingId = useAppSelector(selectAdminMutatingId);

    const [search, setSearch] = useState("");
    const [verifiedFilter, setVerifiedFilter] = useState<"all" | "verified" | "unverified">("all");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        dispatch(
            fetchShopsAdmin({
                search: search || undefined,
                isVerified:
                    verifiedFilter === "all" ? undefined : verifiedFilter === "verified",
                page: currentPage,
            }),
        );
    }, [dispatch, search, verifiedFilter, currentPage]);

    return (
        <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
            <div>
                <h1 className="text-xl font-semibold text-primary sm:text-2xl">Shops</h1>
                {!loading && <p className="text-sm text-secondary">{total} total shops</p>}
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                    placeholder="Search shop name..."
                    className="flex-1 rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary focus:border-zinc-900 focus:outline-none dark:focus:border-zinc-100"
                />
                <select
                    value={verifiedFilter}
                    onChange={(e) => {
                        setVerifiedFilter(e.target.value as typeof verifiedFilter);
                        setCurrentPage(1);
                    }}
                    className="rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary focus:border-zinc-900 focus:outline-none dark:focus:border-zinc-100"
                >
                    <option value="all">All</option>
                    <option value="verified">Verified</option>
                    <option value="unverified">Unverified</option>
                </select>
            </div>

            {loading ? (
                <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-muted" />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {shops.map((shop) => {
                        const owner = typeof shop.owner === "string" ? null : shop.owner;
                        const busy = mutatingId === shop._id;
                        return (
                            <div
                                key={shop._id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-default bg-surface p-4 shadow-sm"
                            >
                                <div className="min-w-0">
                                    <Link
                                        href={`/shop/${shop.slug}`}
                                        target="_blank"
                                        className="text-sm font-semibold text-primary hover:underline"
                                    >
                                        {shop.shopName}
                                    </Link>
                                    <p className="mt-0.5 text-xs text-muted">
                                        {owner?.name ?? "Owner"} · {owner?.email ?? ""}
                                    </p>
                                    <div className="mt-1.5 flex gap-2">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${shop.isVerified
                                                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                                                    : "bg-surface-muted text-muted"
                                                }`}
                                        >
                                            {shop.isVerified ? "Verified" : "Unverified"}
                                        </span>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${shop.isActive
                                                    ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                                                    : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                                                }`}
                                        >
                                            {shop.isActive ? "Active" : "Disabled"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {!shop.isVerified && (
                                        <button
                                            type="button"
                                            onClick={() => dispatch(verifyShopAdmin(shop._id))}
                                            disabled={busy}
                                            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                                        >
                                            Verify
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => dispatch(toggleShopActiveAdmin(shop._id))}
                                        disabled={busy}
                                        className="rounded-lg border border-default px-3 py-1.5 text-xs font-medium text-secondary hover:bg-surface-hover disabled:opacity-50"
                                    >
                                        {shop.isActive ? "Disable" : "Enable"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="rounded-lg border border-default px-3 py-1.5 text-sm text-secondary disabled:opacity-40"
                    >
                        Prev
                    </button>
                    <span className="text-sm text-secondary">
                        Page {page} of {pages}
                    </span>
                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(pages, p + 1))}
                        disabled={page >= pages}
                        className="rounded-lg border border-default px-3 py-1.5 text-sm text-secondary disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}