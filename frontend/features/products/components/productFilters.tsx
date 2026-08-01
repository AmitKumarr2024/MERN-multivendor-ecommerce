"use client";

import { useState } from "react";

import type { ProductQueryParams, ProductSort } from "../types/product.types";

interface ProductFiltersProps {
    value: ProductQueryParams;
    onChange: (next: ProductQueryParams) => void;
}

const SORT_LABELS: Record<ProductSort, string> = {
    newest: "Newest first",
    oldest: "Oldest first",
    price_low_to_high: "Price: Low to High",
    price_high_to_low: "Price: High to Low",
    name_a_to_z: "Name: A to Z",
};

export default function ProductFilters({ value, onChange }: ProductFiltersProps) {
    const [search, setSearch] = useState(value.search ?? "");
    const [minPrice, setMinPrice] = useState(value.minPrice?.toString() ?? "");
    const [maxPrice, setMaxPrice] = useState(value.maxPrice?.toString() ?? "");
    const [showMore, setShowMore] = useState(false);

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onChange({ ...value, search: search.trim() || undefined, page: 1 });
    };

    const applyPriceRange = () => {
        onChange({
            ...value,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            page: 1,
        });
    };

    const clearAll = () => {
        setSearch("");
        setMinPrice("");
        setMaxPrice("");
        onChange({ sort: value.sort, page: 1 });
    };

    const hasActiveFilters = Boolean(
        value.search || value.category || value.minPrice || value.maxPrice,
    );

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <form onSubmit={submitSearch} className="relative flex-1">
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
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                </form>

                <div className="flex items-center gap-2">
                    <select
                        value={value.sort ?? "newest"}
                        onChange={(e) =>
                            onChange({ ...value, sort: e.target.value as ProductSort, page: 1 })
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 shadow-sm focus:border-gray-900 focus:outline-none"
                    >
                        {(Object.keys(SORT_LABELS) as ProductSort[]).map((key) => (
                            <option key={key} value={key}>
                                {SORT_LABELS[key]}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={() => setShowMore((v) => !v)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                            <path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 .8 1.6l-4.8 6.4v4a1 1 0 0 1-.45.83l-2 1.33A1 1 0 0 1 8 16.5v-5.5L3.2 4.6A1 1 0 0 1 3 4Z" />
                        </svg>
                        <span className="hidden sm:inline">Filters</span>
                    </button>
                </div>
            </div>

            {showMore && (
                <div className="mt-3 flex flex-col gap-3 border-t border-gray-100 pt-3 sm:flex-row sm:items-end">
                    <div className="flex flex-1 items-center gap-2">
                        <div className="flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Min price
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                placeholder="₹0"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Max price
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                placeholder="Any"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={applyPriceRange}
                            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                        >
                            Apply
                        </button>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={clearAll}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}