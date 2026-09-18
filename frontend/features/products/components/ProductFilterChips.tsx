"use client";

import { X } from "lucide-react";

import type {
    ProductCategory,
    ProductSort,
} from "../types/product.types";

interface ProductFilterChipsProps {
    categories: ProductCategory[];

    selectedCategory?: string | null;
    minPrice?: string;
    maxPrice?: string;
    sort?: ProductSort;

    onCategoryChange?: (
        category: string | null,
    ) => void;

    onMinPriceChange?: (
        value: string,
    ) => void;

    onMaxPriceChange?: (
        value: string,
    ) => void;

    onSortChange?: (
        value: ProductSort,
    ) => void;
}

const sortLabels: Record<
    ProductSort,
    string
> = {
    newest: "Newest",
    oldest: "Oldest",
    price_low_to_high: "Price: Low to high",
    price_high_to_low: "Price: High to low",
    name_a_to_z: "Name: A to Z",
};

export default function ProductFilterChips({
    categories,
    selectedCategory,
    minPrice,
    maxPrice,
    sort,

    onCategoryChange,
    onMinPriceChange,
    onMaxPriceChange,
    onSortChange,
}: ProductFilterChipsProps) {
    const category = categories.find(
        (item) =>
            item.slug === selectedCategory,
    );

    const showSort =
        sort && sort !== "newest";

    const hasFilters =
        Boolean(category) ||
        Boolean(minPrice) ||
        Boolean(maxPrice) ||
        Boolean(showSort);

    if (!hasFilters) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {category && (
                <FilterChip
                    label={`Category: ${category.name}`}
                    onRemove={() =>
                        onCategoryChange?.(
                            null,
                        )
                    }
                />
            )}

            {minPrice && (
                <FilterChip
                    label={`Min: ₹${minPrice}`}
                    onRemove={() =>
                        onMinPriceChange?.(
                            "",
                        )
                    }
                />
            )}

            {maxPrice && (
                <FilterChip
                    label={`Max: ₹${maxPrice}`}
                    onRemove={() =>
                        onMaxPriceChange?.(
                            "",
                        )
                    }
                />
            )}

            {showSort && (
                <FilterChip
                    label={`Sort: ${
                        sortLabels[sort]
                    }`}
                    onRemove={() =>
                        onSortChange?.(
                            "newest",
                        )
                    }
                />
            )}
        </div>
    );
}

interface FilterChipProps {
    label: string;
    onRemove: () => void;
}

function FilterChip({
    label,
    onRemove,
}: FilterChipProps) {
    return (
        <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 rounded-full border border-default bg-surface px-3 py-1.5 text-xs font-medium text-secondary transition hover:border-accent hover:text-accent"
        >
            {label}

            <X className="h-3 w-3" />
        </button>
    );
}