"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
    fetchAllProducts,
    ProductGrid,
    ProductFilterSidebar,
    type ProductSort,
    type ProductCategory,
} from "@/features/products";

import {
    selectProductItems,
    selectProductListLoading,
    selectProductTotal,
    selectProductSort,
    selectProductError,
} from "@/features/products";

export default function CategoryPage() {
    const params = useParams<{ slug: string }>();

    const dispatch = useAppDispatch();

    const slug = params.slug;

    /* =================================================
       PRODUCT STATE
    ================================================= */

    const products = useAppSelector(
        selectProductItems,
    );

    const loading = useAppSelector(
        selectProductListLoading,
    );

    const total = useAppSelector(
        selectProductTotal,
    );

    const sort = useAppSelector(
        selectProductSort,
    );

    const error = useAppSelector(
        selectProductError,
    );

    /* =================================================
       LOCAL FILTER STATE
    ================================================= */

    const [minPrice, setMinPrice] =
        useState("");

    const [maxPrice, setMaxPrice] =
        useState("");

    const [selectedCategory, setSelectedCategory] =
        useState<string | null>(
            slug ?? null,
        );

    const [selectedSort, setSelectedSort] =
        useState<ProductSort>(
            (sort as ProductSort) ?? "newest",
        );

    /* =================================================
       CATEGORY DATA
    ================================================= */

    const categories = useMemo<
        ProductCategory[]
    >(() => {
        if (!slug) {
            return [];
        }

        return [
            {
                _id: slug,
                name: slug
                    .replace(/-/g, " ")
                    .replace(
                        /\b\w/g,
                        (char) =>
                            char.toUpperCase(),
                    ),
                slug,
            },
        ];
    }, [slug]);

    /* =================================================
       INITIAL FETCH
    ================================================= */

    useEffect(() => {
        if (!slug) {
            return;
        }

        setSelectedCategory(slug);
        setSelectedSort("newest");

        dispatch(
            fetchAllProducts({
                category: slug,
                page: 1,
                limit: 20,
                sort: "newest",
            }),
        );
    }, [dispatch, slug]);

    /* =================================================
       CATEGORY CHANGE
    ================================================= */

    const handleCategoryChange = (
        category: string | null,
    ) => {
        setSelectedCategory(category);

        dispatch(
            fetchAllProducts({
                category:
                    category || undefined,

                minPrice: minPrice
                    ? Number(minPrice)
                    : undefined,

                maxPrice: maxPrice
                    ? Number(maxPrice)
                    : undefined,

                page: 1,
                limit: 20,

                sort: selectedSort,
            }),
        );
    };

    /* =================================================
       MIN PRICE
    ================================================= */

    const handleMinPriceChange = (
        value: string,
    ) => {
        setMinPrice(value);

        dispatch(
            fetchAllProducts({
                category:
                    selectedCategory ||
                    undefined,

                minPrice: value
                    ? Number(value)
                    : undefined,

                maxPrice: maxPrice
                    ? Number(maxPrice)
                    : undefined,

                page: 1,
                limit: 20,

                sort: selectedSort,
            }),
        );
    };

    /* =================================================
       MAX PRICE
    ================================================= */

    const handleMaxPriceChange = (
        value: string,
    ) => {
        setMaxPrice(value);

        dispatch(
            fetchAllProducts({
                category:
                    selectedCategory ||
                    undefined,

                minPrice: minPrice
                    ? Number(minPrice)
                    : undefined,

                maxPrice: value
                    ? Number(value)
                    : undefined,

                page: 1,
                limit: 20,

                sort: selectedSort,
            }),
        );
    };

    /* =================================================
       SORT
    ================================================= */

    const handleSortChange = (
        value: ProductSort,
    ) => {
        setSelectedSort(value);

        dispatch(
            fetchAllProducts({
                category:
                    selectedCategory ||
                    undefined,

                minPrice: minPrice
                    ? Number(minPrice)
                    : undefined,

                maxPrice: maxPrice
                    ? Number(maxPrice)
                    : undefined,

                page: 1,
                limit: 20,

                sort: value,
            }),
        );
    };

    /* =================================================
       CLEAR FILTERS
    ================================================= */

    const handleClear = () => {
        setMinPrice("");
        setMaxPrice("");
        setSelectedSort("newest");

        /*
         * Keep the user inside the current category.
         */

        setSelectedCategory(slug ?? null);

        dispatch(
            fetchAllProducts({
                category: slug,
                page: 1,
                limit: 20,
                sort: "newest",
            }),
        );
    };

    /* =================================================
       CATEGORY NAME
    ================================================= */

    const categoryName = slug
        ? slug
            .replace(/-/g, " ")
            .replace(
                /\b\w/g,
                (char) =>
                    char.toUpperCase(),
            )
        : "Category";

    /* =================================================
       RENDER
    ================================================= */

    return (
        <main className="container mx-auto px-4 py-8">
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-primary">
                    {categoryName}
                </h1>

                <p className="mt-2 text-secondary">
                    Browse products in{" "}
                    {categoryName}.
                </p>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* =================================================
                FILTER SIDEBAR + PRODUCTS
            ================================================= */}

            <div className="flex flex-col gap-6 lg:flex-row">
                {/* =================================================
                    FILTER SIDEBAR
                ================================================= */}

                <aside className="w-full shrink-0 lg:w-72">
                    <ProductFilterSidebar
                        categories={categories}
                        selectedCategory={selectedCategory}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        sort={selectedSort}
                        productCount={total}
                        onCategoryChange={handleCategoryChange}
                        onMinPriceChange={handleMinPriceChange}
                        onMaxPriceChange={handleMaxPriceChange}
                        onClear={handleClear}
                    />
                </aside>

                {/* =================================================
                    PRODUCTS
                ================================================= */}

                <section className="min-w-0 flex-1">
                    {/* Product count */}

                    {!loading && !error && (
                        <div className="mb-5 flex items-center justify-between">
                            <p className="text-sm text-secondary">
                                <span className="font-medium text-primary">
                                    {total}
                                </span>{" "}
                                {total === 1
                                    ? "product"
                                    : "products"}{" "}
                                found
                            </p>
                        </div>
                    )}

                    <ProductGrid
                        products={products}
                        loading={loading}
                    />

                    {/* =================================================
                        EMPTY STATE
                    ================================================= */}

                    {!loading &&
                        !error &&
                        products.length === 0 && (
                            <div className="mt-6 rounded-xl border border-dashed border-default bg-surface p-12 text-center">
                                <h2 className="text-lg font-semibold text-primary">
                                    No products
                                    found
                                </h2>

                                <p className="mt-2 text-sm text-secondary">
                                    There are
                                    currently no
                                    products
                                    matching
                                    your
                                    filters.
                                </p>

                                <button
                                    type="button"
                                    onClick={
                                        handleClear
                                    }
                                    className="mt-5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                                >
                                    Clear
                                    filters
                                </button>
                            </div>
                        )}
                </section>
            </div>
        </main>
    );
}