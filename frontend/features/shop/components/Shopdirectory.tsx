"use client";

import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllShops } from "../store/shopSlice";
import {
    selectDirectoryLoading,
    selectShopPage,
    selectShopPages,
    selectShopTotal,
    selectShops,
} from "../store/shopSelectors";

import ShopCard from "./Shopcard";

export default function ShopDirectory() {
    const dispatch = useAppDispatch();

    const shops = useAppSelector(selectShops);
    const total = useAppSelector(selectShopTotal);
    const page = useAppSelector(selectShopPage);
    const pages = useAppSelector(selectShopPages);
    const loading = useAppSelector(selectDirectoryLoading);

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        dispatch(fetchAllShops({ search: search || undefined, page: currentPage }));
    }, [dispatch, search, currentPage]);

    return (
        <div className="mx-auto max-w-4xl space-y-4 p-4 sm:space-y-6 sm:p-6">
            <div>
                <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">All shops</h1>
                {!loading && <p className="text-sm text-gray-500">{total} shops found</p>}
            </div>

            <div className="relative">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                    placeholder="Search shops..."
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
                <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                >
                    <path
                        fillRule="evenodd"
                        d="M9 3.5a5.5 5.5 0 1 0 3.61 9.65l3.62 3.62a.75.75 0 1 0 1.06-1.06l-3.62-3.62A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-19 animate-pulse rounded-2xl border border-gray-200 bg-gray-50"
                        />
                    ))}
                </div>
            ) : shops.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center text-sm text-gray-500">
                    No shops found.
                </div>
            ) : (
                <div className="space-y-3">
                    {shops.map((shop) => (
                        <ShopCard key={shop._id} shop={shop} />
                    ))}
                </div>
            )}

            {pages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 disabled:opacity-40"
                    >
                        Prev
                    </button>
                    <span className="text-sm text-gray-500">
                        Page {page} of {pages}
                    </span>
                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(pages, p + 1))}
                        disabled={page >= pages}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}