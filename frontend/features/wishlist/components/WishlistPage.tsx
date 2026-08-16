"use client";

import { useEffect } from "react";
import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyWishlist, clearWishlist } from "../store/wishlistSlice";
import {
    selectWishlistProducts,
    selectWishlistLoading,
    selectWishlistError,
} from "../store/wishlistSelectors";
import ProductCard from "@/features/products/components/productCard";
import ProductCardSkeleton from "@/features/products/components/productCardSkeleton";

export default function WishlistPage() {
    const dispatch = useAppDispatch();
    const products = useAppSelector(selectWishlistProducts);
    const loading = useAppSelector(selectWishlistLoading);
    const error = useAppSelector(selectWishlistError);

    useEffect(() => {
        dispatch(fetchMyWishlist());
    }, [dispatch]);

    return (
        <div className="mx-auto max-w-7xl space-y-4 p-4 sm:space-y-6 sm:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-primary sm:text-2xl">My Wishlist</h1>
                    {!loading && <p className="text-sm text-secondary">{products.length} items saved</p>}
                </div>
                {products.length > 0 && (
                    <button
                        type="button"
                        onClick={() => dispatch(clearWishlist())}
                        className="text-sm font-medium text-secondary hover:text-primary"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {error ? (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                    {error}
                </div>
            ) : null}

            {loading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-default bg-surface py-20 text-center">
                    <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="mb-3 h-12 w-12 text-muted"
                    >
                        <path d="M10 17.3 3.5 11c-2-2-2-5.2 0-7.1 2-1.9 5-1.7 6.5.5 1.5-2.2 4.5-2.4 6.5-.5 2 1.9 2 5.1 0 7.1L10 17.3Z" />
                    </svg>
                    <p className="text-sm font-medium text-primary">Your wishlist is empty</p>
                    <p className="mt-1 text-sm text-secondary">
                        Save items you like by tapping the heart icon.
                    </p>
                    <Link
                        href="/products"
                        className="mt-4 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    >
                        Browse products
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                    {products.map((product) => (
                        // WishlistProduct is a subset of Product; ProductCard only
                        // reads the fields present here (name/images/price/shop/stock).
                        <ProductCard key={product._id} product={product as never} />
                    ))}
                </div>
            )}
        </div>
    );
}