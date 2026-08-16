"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
    fetchAllProducts,
    ProductGrid,
    ProductFilters,
} from "@/features/products";

import {
    selectProductItems,
    selectProductListLoading,
    selectProductTotal,
    selectProductPages,
    selectProductPage,
    selectProductSort,
    selectProductError,
} from "@/features/products";

export default function CategoryPage() {
    const params = useParams<{ slug: string }>();

    const dispatch = useAppDispatch();

    const slug = params.slug;

    const products = useAppSelector(
        selectProductItems,
    );

    const loading = useAppSelector(
        selectProductListLoading,
    );

    const total = useAppSelector(
        selectProductTotal,
    );

    const pages = useAppSelector(
        selectProductPages,
    );

    const page = useAppSelector(
        selectProductPage,
    );

    const sort = useAppSelector(
        selectProductSort,
    );

    const error = useAppSelector(
        selectProductError,
    );

    useEffect(() => {
        if (!slug) return;

        dispatch(
            fetchAllProducts({
                category: slug,
                page: 1,
                limit: 20,
                sort: "newest",
            }),
        );
    }, [dispatch, slug]);

    const categoryName = slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) =>
            char.toUpperCase(),
        );

    return (
        <main className="container mx-auto px-4 py-8">
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary">
                    {categoryName}
                </h1>

                <p className="mt-2 text-secondary">
                    Browse products in the{" "}
                    {categoryName} category.
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
                PRODUCT COUNT
            ================================================= */}

            {!loading && !error && (
                <p className="mb-6 text-sm text-secondary">
                    {total}{" "}
                    {total === 1
                        ? "product"
                        : "products"}{" "}
                    found
                </p>
            )}

            {/* =================================================
                PRODUCTS
            ================================================= */}

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
                    <div className="rounded-xl border border-dashed border-default bg-surface p-12 text-center">
                        <h2 className="text-lg font-semibold text-primary">
                            No products found
                        </h2>

                        <p className="mt-2 text-sm text-secondary">
                            There are currently no
                            products in this
                            category.
                        </p>
                    </div>
                )}
        </main>
    );
}