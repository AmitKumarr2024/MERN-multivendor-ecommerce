"use client";

import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllProducts } from "../store/Productslice";
import {
    selectProductError,
    selectProductItems,
    selectProductListLoading,
    selectProductPage,
    selectProductPages,
    selectProductTotal,
} from "../store/Productselectors";
import type { ProductQueryParams } from "../types/product.types";

import ProductGrid from "./productGrid";
import Pagination from "./pagination";

interface ProductListPageProps {
    /** Lock the feed to one category slug, e.g. for a category landing page. */
    initialCategory?: string;
    title?: string;
}

export default function ProductListPage({
    initialCategory,
    title = "All products",
}: ProductListPageProps) {
    const dispatch = useAppDispatch();

    const products = useAppSelector(selectProductItems);
    const total = useAppSelector(selectProductTotal);
    const page = useAppSelector(selectProductPage);
    const pages = useAppSelector(selectProductPages);
    const loading = useAppSelector(selectProductListLoading);
    const error = useAppSelector(selectProductError);

    const [query, setQuery] = useState<ProductQueryParams>({
        category: initialCategory,
        sort: "newest",
        page: 1,
        limit: 20,
    });

    useEffect(() => {
        dispatch(fetchAllProducts(query));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    return (
        <div className="mx-auto max-w-7xl space-y-4 p-4 sm:space-y-6 sm:p-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-primary sm:text-2xl">
                        {title}
                    </h1>

                    {!loading && (
                        <p className="text-sm text-secondary">
                            {total} products found
                        </p>
                    )}
                </div>
            </div>

            {error ? (
                <div className="rounded-lg bg-danger-bg px-4 py-3 text-sm text-danger-text">
                    {error}
                </div>
            ) : null}

            <ProductGrid products={products} loading={loading} />

            <Pagination
                page={page}
                pages={pages}
                onPageChange={(p) =>
                    setQuery((q) => ({ ...q, page: p }))
                }
            />
        </div>
    );
}