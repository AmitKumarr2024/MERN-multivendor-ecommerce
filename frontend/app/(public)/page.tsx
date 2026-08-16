"use client";

import { useEffect } from "react";
import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    fetchAllProducts,
    ProductGrid,
    selectProductItems,
    selectProductListLoading,
} from "@/features/products";

export default function HomePage() {
    const dispatch = useAppDispatch();

    const products = useAppSelector(selectProductItems);
    const loading = useAppSelector(selectProductListLoading);

    useEffect(() => {
        dispatch(fetchAllProducts({ sort: "newest", limit: 10 }));
    }, [dispatch]);

    return (
        <main className="min-h-screen">
            {/* Hero */}
            <section className="bg-linear-to-b from-surface-muted to-surface">
                <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
                    <span className="inline-flex items-center rounded-full bg-surface-hover px-3 py-1 text-xs font-semibold text-secondary">
                        Now live across India
                    </span>

                    <h1 className="mt-5 text-3xl font-black tracking-tight text-primary sm:text-5xl">
                        Shop from trusted sellers,
                        <br className="hidden sm:block" />
                        all in one marketplace.
                    </h1>

                    <p className="mx-auto mt-4 max-w-xl text-sm text-secondary sm:text-base">
                        Discover quality products across electronics, fashion, home &amp;
                        living, and more — delivered fast, backed by secure payments.
                    </p>

                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href="/buyer/products"
                            className="w-full rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground transition hover:opacity-90 sm:w-auto"
                        >
                            Start shopping
                        </Link>
                        <Link
                            href="/seller/shop"
                            className="w-full rounded-full border border-strong px-6 py-3 text-sm font-bold text-primary transition hover:border-accent hover:bg-accent hover:text-accent-foreground sm:w-auto"
                        >
                            Sell on Marketplace
                        </Link>
                    </div>
                </div>
            </section>

            {/* Popular categories */}
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-primary sm:text-xl">
                        Popular categories
                    </h2>
                    <Link
                        href="/categories"
                        className="text-sm font-semibold text-secondary hover:text-primary"
                    >
                        View all →
                    </Link>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
                    {[
                        "Electronics",
                        "Fashion",
                        "Home & Living",
                        "Beauty",
                        "Sports",
                        "Accessories",
                    ].map((category) => (
                        <Link
                            key={category}
                            href={`/categories/${category.toLowerCase().replace(/\s+&?\s*/g, "-")}`}
                            className="flex h-24 items-center justify-center rounded-2xl border border-default bg-surface px-3 text-center text-sm font-medium text-primary shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            {category}
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured / newest products */}
            <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-primary sm:text-xl">
                        New arrivals
                    </h2>
                    <Link
                        href="/products"
                        className="text-sm font-semibold text-secondary hover:text-primary"
                    >
                        View all →
                    </Link>
                </div>

                <div className="mt-6">
                    <ProductGrid
                        products={products}
                        loading={loading}
                        emptyMessage="No products listed yet — check back soon."
                    />
                </div>
            </section>
        </main>
    );
}