"use client";

import {
    Check,
    ChevronDown,
    RotateCcw,
    SlidersHorizontal,
} from "lucide-react";

import type {
    ProductCategory,
    ProductSort,
} from "../types/product.types";

interface ProductFilterSidebarProps {
    categories: ProductCategory[];

    selectedCategory?: string | null;
    minPrice?: string;
    maxPrice?: string;
    sort?: ProductSort;

    productCount?: number;

    onCategoryChange?: (
        category: string | null,
    ) => void;

    onMinPriceChange?: (
        value: string,
    ) => void;

    onMaxPriceChange?: (
        value: string,
    ) => void;

    onClear?: () => void;
}

export default function ProductFilterSidebar({
    categories,
    selectedCategory = null,
    minPrice = "",
    maxPrice = "",
    sort = "newest",
    productCount,

    onCategoryChange,
    onMinPriceChange,
    onMaxPriceChange,
    onClear,
}: ProductFilterSidebarProps) {
    const hasFilters =
        Boolean(selectedCategory) ||
        Boolean(minPrice) ||
        Boolean(maxPrice) ||
        sort !== "newest";

    return (
        <aside className="w-full">
            <div className="rounded-2xl border border-default bg-surface">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-default px-5 py-4">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4 text-accent" />

                        <h2 className="text-sm font-semibold text-primary">
                            Filters
                        </h2>
                    </div>

                    {hasFilters && onClear && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Reset
                        </button>
                    )}
                </div>

                {/* Result count */}
                {typeof productCount === "number" && (
                    <div className="border-b border-default px-5 py-3">
                        <p className="text-xs text-secondary">
                            <span className="font-medium text-primary">
                                {productCount}
                            </span>{" "}
                            {productCount === 1
                                ? "product"
                                : "products"}{" "}
                            found
                        </p>
                    </div>
                )}

                <div className="divide-y divide-default">

                    {/* Category */}
                    <section className="px-5 py-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-primary">
                                Category
                            </h3>

                            <ChevronDown className="h-4 w-4 text-muted" />
                        </div>

                        <div className="space-y-1">

                            {/* All categories */}
                            <button
                                type="button"
                                onClick={() =>
                                    onCategoryChange?.(null)
                                }
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${!selectedCategory
                                        ? "bg-accent/10 font-medium text-accent"
                                        : "text-secondary hover:bg-surface-muted"
                                    }`}
                            >
                                <span
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${!selectedCategory
                                            ? "border-accent bg-accent text-white"
                                            : "border-default"
                                        }`}
                                >
                                    {!selectedCategory && (
                                        <Check className="h-3 w-3" />
                                    )}
                                </span>

                                All categories
                            </button>

                            {categories.map((category) => {
                                const selected =
                                    selectedCategory ===
                                    category.slug;

                                return (
                                    <button
                                        key={category._id}
                                        type="button"
                                        onClick={() =>
                                            onCategoryChange?.(
                                                category.slug,
                                            )
                                        }
                                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${selected
                                                ? "bg-accent/10 font-medium text-accent"
                                                : "text-secondary hover:bg-surface-muted"
                                            }`}
                                    >
                                        <span
                                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${selected
                                                    ? "border-accent bg-accent text-white"
                                                    : "border-default"
                                                }`}
                                        >
                                            {selected && (
                                                <Check className="h-3 w-3" />
                                            )}
                                        </span>

                                        <span className="truncate">
                                            {category.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Price */}
                    <section className="px-5 py-5">
                        <h3 className="mb-4 text-sm font-semibold text-primary">
                            Price
                        </h3>

                        <div className="grid grid-cols-2 gap-3">

                            {/* Min */}
                            <div>
                                <label className="mb-1.5 block text-xs text-secondary">
                                    Min price
                                </label>

                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">
                                        ₹
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        value={minPrice}
                                        onChange={(event) =>
                                            onMinPriceChange?.(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="0"
                                        className="h-10 w-full rounded-lg border border-default bg-surface-muted pl-7 pr-2 text-sm text-primary outline-none transition focus:border-accent"
                                    />
                                </div>
                            </div>

                            {/* Max */}
                            <div>
                                <label className="mb-1.5 block text-xs text-secondary">
                                    Max price
                                </label>

                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted">
                                        ₹
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        value={maxPrice}
                                        onChange={(event) =>
                                            onMaxPriceChange?.(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Any"
                                        className="h-10 w-full rounded-lg border border-default bg-surface-muted pl-7 pr-2 text-sm text-primary outline-none transition focus:border-accent"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </aside>
    );
}