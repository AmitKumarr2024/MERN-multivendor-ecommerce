"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProductsAdmin, toggleProductActiveAdmin, forceDeleteProductAdmin } from "../store/Adminslice";
import {
    selectAdminError,
    selectAdminMutatingId,
    selectAdminProducts,
    selectProductsLoading,
    selectProductsPage,
    selectProductsPages,
    selectProductsTotal,
} from "../store/Adminselectors";

function formatPrice(value: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
}

export default function AdminProductsTable() {
    const dispatch = useAppDispatch();

    const products = useAppSelector(selectAdminProducts);
    const total = useAppSelector(selectProductsTotal);
    const page = useAppSelector(selectProductsPage);
    const pages = useAppSelector(selectProductsPages);
    const loading = useAppSelector(selectProductsLoading);
    const error = useAppSelector(selectAdminError);
    const mutatingId = useAppSelector(selectAdminMutatingId);

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchProductsAdmin({ search: search || undefined, page: currentPage }));
    }, [dispatch, search, currentPage]);

    const handleDelete = (id: string) => {
        if (confirmDeleteId !== id) {
            setConfirmDeleteId(id);
            return;
        }
        dispatch(forceDeleteProductAdmin(id));
        setConfirmDeleteId(null);
    };

    return (
        <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
            <div>
                <h1 className="text-xl font-semibold text-primary sm:text-2xl">Products</h1>
                {!loading && <p className="text-sm text-secondary">{total} total products</p>}
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                    {error}
                </div>
            )}

            <input
                type="text"
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                }}
                placeholder="Search products..."
                className="w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary focus:border-zinc-900 focus:outline-none dark:focus:border-zinc-100"
            />

            {loading ? (
                <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-muted" />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {products.map((product) => {
                        const shop = typeof product.shop === "string" ? null : product.shop;
                        const busy = mutatingId === product._id;
                        const confirming = confirmDeleteId === product._id;
                        const image = product.images?.[0];
                        return (
                            <div
                                key={product._id}
                                className="flex flex-wrap items-center gap-3 rounded-2xl border border-default bg-surface p-3 shadow-sm sm:p-4"
                            >
                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                                    {image && (
                                        <Image src={image} alt={product.name} fill sizes="48px" className="object-cover" />
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-primary">
                                        {product.name}
                                    </p>
                                    <p className="text-xs text-muted">
                                        {shop?.shopName ?? "Shop"} · {formatPrice(product.price)} ·{" "}
                                        {product.stock} in stock
                                    </p>
                                </div>

                                <span
                                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                        product.isActive
                                            ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                                            : "bg-surface-muted text-muted"
                                    }`}
                                >
                                    {product.isActive ? "Visible" : "Hidden"}
                                </span>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => dispatch(toggleProductActiveAdmin(product._id))}
                                        disabled={busy}
                                        className="rounded-lg border border-default px-3 py-1.5 text-xs font-medium text-secondary hover:bg-surface-hover disabled:opacity-50"
                                    >
                                        {product.isActive ? "Hide" : "Show"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(product._id)}
                                        disabled={busy}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
                                            confirming
                                                ? "bg-red-600 text-white hover:bg-red-700"
                                                : "border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                                        }`}
                                    >
                                        {confirming ? "Confirm delete" : "Delete"}
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