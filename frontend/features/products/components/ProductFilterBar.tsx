"use client";

import { SlidersHorizontal } from "lucide-react";

import type { ProductSort } from "../types/product.types";

interface ProductFilterBarProps {
    productCount: number;
    sort: ProductSort;
    hasFilters?: boolean;
    onSortChange: (sort: ProductSort) => void;
    onClear?: () => void;
}

export default function ProductFilterBar({
    productCount,
    sort,
    hasFilters = false,
    onSortChange,
    onClear,
}: ProductFilterBarProps) {
    return (
        <div className="flex items-center justify-between gap-4">
            {/* Product Count */}
            <div className="flex items-center gap-2 text-sm text-secondary">
                <SlidersHorizontal className="h-4 w-4" />

                <span>
                    {productCount}{" "}
                    {productCount === 1
                        ? "product"
                        : "products"}
                </span>
            </div>

            <div className="flex items-center gap-3">
                {/* Sort */}
                <select
                    value={sort}
                    onChange={(event) =>
                        onSortChange(
                            event.target
                                .value as ProductSort,
                        )
                    }
                    className="
                        h-10
                        rounded-lg
                        border border-default
                        bg-surface
                        px-3
                        text-sm
                        text-primary
                        outline-none
                        focus:border-accent
                    "
                >
                    <option value="newest">
                        Newest
                    </option>

                    <option value="oldest">
                        Oldest
                    </option>

                    <option value="price_low_to_high">
                        Price: Low to high
                    </option>

                    <option value="price_high_to_low">
                        Price: High to low
                    </option>

                    <option value="name_a_to_z">
                        Name: A to Z
                    </option>
                </select>

                {/* Clear */}
                {hasFilters && onClear && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="
                            text-xs
                            font-medium
                            text-accent
                            hover:underline
                        "
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}