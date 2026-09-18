"use client";

import { useMemo, useState } from "react";
import {
    ChevronRight,
    Package,
} from "lucide-react";

import {
    ShopBroadcastBanner,
    StartChatButton,
} from "@/features/messaging";

import { ProductGrid } from "@/features/products";
import type { Product } from "@/features/products";

interface ProductsSectionProps {
    shopSlug: string;
    shopId: string;
    shopName: string;
    products: Product[];
    productsLoading: boolean;
}

interface ProductCategoryInfo {
    id: string;
    name: string;
    slug?: string;
}

/**
 * Extract category information from the existing Product type.
 *
 * Product.category is already typed as:
 *
 * string | ProductCategory
 *
 * so we handle both cases here without overriding the
 * Product interface.
 */
function getCategoryInfo(
    product: Product,
): ProductCategoryInfo | null {
    const category = product.category;

    /* =============================================================
       CATEGORY IS A STRING
       ============================================================= */
    if (typeof category === "string") {
        const value = category.trim();

        if (!value) {
            return null;
        }

        return {
            id: value,
            name: value,
        };
    }

    /* =============================================================
       CATEGORY IS AN OBJECT
       ============================================================= */
    if (category && typeof category === "object") {
        const categoryObject = category as {
            _id?: string;
            id?: string;
            name?: string;
            slug?: string;
        };

        const id =
            categoryObject._id ||
            categoryObject.id ||
            categoryObject.slug ||
            categoryObject.name ||
            "";

        const name =
            categoryObject.name ||
            categoryObject.slug ||
            "Uncategorized";

        if (!id) {
            return null;
        }

        return {
            id,
            name,
            slug: categoryObject.slug,
        };
    }

    return null;
}

export default function ProductsSection({
    shopSlug,
    shopId,
    shopName,
    products,
    productsLoading,
}: ProductsSectionProps) {
    const [selectedCategory, setSelectedCategory] =
        useState<string>("all");

    const [showAllCategories, setShowAllCategories] =
        useState(false);

    /* =============================================================
       BUILD CATEGORIES FROM THIS SHOP'S PRODUCTS
       ============================================================= */
    const categories = useMemo(() => {
        const categoryMap = new Map<
            string,
            ProductCategoryInfo
        >();

        products.forEach((product) => {
            const category = getCategoryInfo(product);

            if (!category) {
                return;
            }

            if (!categoryMap.has(category.id)) {
                categoryMap.set(category.id, category);
            }
        });

        return Array.from(categoryMap.values()).sort((a, b) =>
            a.name.localeCompare(b.name),
        );
    }, [products]);

    /* =============================================================
       FILTER PRODUCTS
       ============================================================= */
    const filteredProducts = useMemo(() => {
        if (selectedCategory === "all") {
            return products;
        }

        return products.filter((product) => {
            const category = getCategoryInfo(product);

            return category?.id === selectedCategory;
        });
    }, [products, selectedCategory]);

    /* =============================================================
       VISIBLE CATEGORIES
       ============================================================= */
    const visibleCategories = showAllCategories
        ? categories
        : categories.slice(0, 5);

    /* =============================================================
       CATEGORY CHANGE
       ============================================================= */
    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategory(categoryId);
    };

    return (
        <section className="overflow-hidden rounded-2xl border border-default bg-surface">
            {/* =========================================================
                HEADER
               ========================================================= */}
            <div className="flex items-center justify-between gap-3 border-b border-default px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                        <Package className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-bold text-primary">
                            Products
                        </h2>

                        <p className="mt-0.5 truncate text-[11px] text-muted">
                            {productsLoading
                                ? "Loading products..."
                                : `${products.length} item${products.length !== 1
                                    ? "s"
                                    : ""
                                } available`}
                        </p>
                    </div>
                </div>

                <div className="shrink-0">
                    <StartChatButton shopId={shopId} />
                </div>
            </div>

            {/* =========================================================
                CONTENT
               ========================================================= */}
            <div className="px-3 py-3 sm:px-4">
                {/* =====================================================
                    CATEGORY FILTER
                   ===================================================== */}
                {!productsLoading && categories.length > 0 && (
                    <div className="mb-4">
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-primary">
                                Shop categories
                            </p>

                            {categories.length > 5 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowAllCategories(
                                            (previous) =>
                                                !previous,
                                        )
                                    }
                                    className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-accent transition-opacity hover:opacity-80"
                                >
                                    {showAllCategories
                                        ? "Show less"
                                        : `View all (${categories.length})`}

                                    <ChevronRight className="h-3 w-3" />
                                </button>
                            )}
                        </div>

                        {/* Category pills */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                            {/* All */}
                            <button
                                type="button"
                                onClick={() =>
                                    handleCategoryChange("all")
                                }
                                aria-pressed={
                                    selectedCategory === "all"
                                }
                                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${selectedCategory === "all"
                                        ? "border-accent bg-accent text-accent-foreground"
                                        : "border-default bg-surface text-secondary hover:border-accent/40 hover:text-primary"
                                    }`}
                            >
                                All
                            </button>

                            {/* Categories */}
                            {visibleCategories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() =>
                                        handleCategoryChange(
                                            category.id,
                                        )
                                    }
                                    aria-pressed={
                                        selectedCategory ===
                                        category.id
                                    }
                                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${selectedCategory ===
                                            category.id
                                            ? "border-accent bg-accent text-accent-foreground"
                                            : "border-default bg-surface text-secondary hover:border-accent/40 hover:text-primary"
                                        }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* =====================================================
                    SHOP BROADCAST
                   ===================================================== */}
                <ShopBroadcastBanner shopSlug={shopSlug} />

                {/* =====================================================
                    FILTER RESULT INFO
                   ===================================================== */}
                {!productsLoading &&
                    selectedCategory !== "all" && (
                        <div className="mb-3 mt-3 flex items-center justify-between gap-3">
                            <p className="text-xs text-secondary">
                                Showing{" "}
                                <span className="font-semibold text-primary">
                                    {filteredProducts.length}
                                </span>{" "}
                                product
                                {filteredProducts.length !== 1
                                    ? "s"
                                    : ""}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    handleCategoryChange("all")
                                }
                                className="shrink-0 text-[11px] font-medium text-accent hover:opacity-80"
                            >
                                Clear filter
                            </button>
                        </div>
                    )}

                {/* =====================================================
                    PRODUCTS
                   ===================================================== */}
                <div className="mt-3">
                    <ProductGrid
                        products={filteredProducts}
                        loading={productsLoading}
                        emptyMessage={
                            selectedCategory !== "all"
                                ? "No products found in this category."
                                : "This shop hasn't listed any products yet."
                        }
                    />
                </div>
            </div>
        </section>
    );
}