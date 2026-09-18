"use client";

import type { ProductVariant } from "../types/product.types";

interface VariantSelectorProps {
    variants: ProductVariant[];
    selectedVariantId: string | null;
    onSelect: (variantId: string) => void;
}

export default function VariantSelector({ variants, selectedVariantId, onSelect }: VariantSelectorProps) {
    const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[];
    const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[];

    const selected = variants.find((v) => v._id === selectedVariantId);

    const findVariant = (color?: string | null, size?: string | null) =>
        variants.find((v) => (color ? v.color === color : true) && (size ? v.size === size : true));

    return (
        <div className="space-y-4">
            {colors.length > 0 && (
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-primary">
                        Color{selected?.color ? `: ${selected.color}` : ""}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {colors.map((color) => {
                            const isActive = selected?.color === color;
                            const match = findVariant(color, selected?.size);
                            const outOfStock = match ? match.stock === 0 : false;
                            return (
                                <button
                                    key={color}
                                    type="button"
                                    disabled={outOfStock && !isActive}
                                    onClick={() => {
                                        const next = findVariant(color, selected?.size) ?? findVariant(color, null);
                                        if (next) onSelect(next._id);
                                    }}
                                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${isActive
                                            ? "border-accent bg-accent text-accent-foreground"
                                            : "border-default text-primary hover:bg-surface-hover"
                                        } ${outOfStock && !isActive ? "cursor-not-allowed opacity-40" : ""}`}
                                >
                                    {color}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {sizes.length > 0 && (
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-primary">
                        Size{selected?.size ? `: ${selected.size}` : ""}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {sizes.map((size) => {
                            const isActive = selected?.size === size;
                            const match = findVariant(selected?.color, size);
                            const outOfStock = match ? match.stock === 0 : false;
                            return (
                                <button
                                    key={size}
                                    type="button"
                                    disabled={outOfStock && !isActive}
                                    onClick={() => {
                                        const next = findVariant(selected?.color, size) ?? findVariant(null, size);
                                        if (next) onSelect(next._id);
                                    }}
                                    className={`min-w-11 rounded-lg border px-3 py-1.5 text-sm transition-colors ${isActive
                                            ? "border-accent bg-accent text-accent-foreground"
                                            : "border-default text-primary hover:bg-surface-hover"
                                        } ${outOfStock && !isActive ? "cursor-not-allowed opacity-40" : ""}`}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {selected && selected.stock === 0 && (
                <p className="text-xs text-red-600 dark:text-red-400">This combination is out of stock.</p>
            )}
        </div>
    );
}