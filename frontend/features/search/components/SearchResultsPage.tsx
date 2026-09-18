"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { runSearch, clearSearchResults } from "../store/searchSlice";
import {
    selectSearchProducts,
    selectSearchTotal,
    selectSearchPage,
    selectSearchPages,
    selectSearchFallback,
    selectSearchLoading,
} from "../store/searchSelectors";
import { ProductGrid, Pagination } from "@/features/products";

export default function SearchResultsPage() {
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const q = searchParams.get("q") || "";

    const products = useAppSelector(selectSearchProducts);
    const total = useAppSelector(selectSearchTotal);
    const page = useAppSelector(selectSearchPage);
    const pages = useAppSelector(selectSearchPages);
    const fallback = useAppSelector(selectSearchFallback);
    const loading = useAppSelector(selectSearchLoading);

    useEffect(() => {
        if (!q) return;
        dispatch(runSearch({ q, page: 1 }));
        return () => {
            dispatch(clearSearchResults());
        };
    }, [dispatch, q]);

    if (!q) {
        return (
            <div className="mx-auto max-w-7xl p-4 sm:p-6">
                <p className="text-sm text-secondary">Enter a search term to get started.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6">
            <div>
                <h1 className="text-xl font-semibold text-primary sm:text-2xl">
                    {loading ? "Searching..." : `Results for "${q}"`}
                </h1>
                {!loading && (
                    <p className="text-sm text-secondary">{total} product{total !== 1 ? "s" : ""} found</p>
                )}
            </div>

            <ProductGrid products={products} loading={loading} emptyMessage="" />

            {!loading && total === 0 && (
                <div className="space-y-5 rounded-2xl border border-dashed border-default bg-surface p-8 text-center">
                    <p className="text-sm text-secondary">
                        No results for &quot;{q}&quot;. Try a different spelling or browse a category below.
                    </p>

                    {fallback && fallback.categories.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2">
                            {fallback.categories.map((c) => (
                                <Link
                                    key={c._id}
                                    href={`/products?category=${c.slug}`}
                                    className="rounded-full border border-default px-4 py-1.5 text-sm text-primary hover:bg-surface-hover"
                                >
                                    {c.name}
                                </Link>
                            ))}
                        </div>
                    )}

                    {fallback && fallback.popularProducts.length > 0 && (
                        <div className="mt-6 text-left">
                            <p className="mb-3 text-sm font-medium text-primary">Popular right now</p>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                {fallback.popularProducts.map((p) => (
                                    <Link
                                        key={p._id}
                                        href={`/products/${p._id}`}
                                        className="rounded-xl border border-default bg-surface p-3 text-sm text-primary hover:bg-surface-hover"
                                    >
                                        {p.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {pages > 1 && (
                <Pagination page={page} pages={pages} onPageChange={(p) => dispatch(runSearch({ q, page: p }))} />
            )}
        </div>
    );
}