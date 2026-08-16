"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { selectCurrentUser } from "@/features/auth/store/authSelector";

import {
    fetchProductById,
    clearCurrentProduct,
} from "../store/Productslice";

import {
    selectCurrentProduct,
    selectProductDetailLoading,
    selectProductError,
} from "../store/Productselectors";

import {
    formatPrice,
    getCategoryInfo,
    getShopInfo,
    resolveDiscountPercent,
    resolveEffectivePrice,
} from "../utils/productHelpers";

import AddToCartButton from "@/features/cart/components/Addtocartbutton";
import { WishlistButton } from "@/features/wishlist";

interface ProductDetailProps {
    productId: string;
}

export default function ProductDetail({
    productId,
}: ProductDetailProps) {
    const dispatch = useAppDispatch();

    // =========================================================
    // AUTH
    // =========================================================

    const user = useAppSelector(selectCurrentUser);

    // =========================================================
    // PRODUCT
    // =========================================================

    const product = useAppSelector(selectCurrentProduct);
    const loading = useAppSelector(selectProductDetailLoading);
    const error = useAppSelector(selectProductError);

    const [activeImage, setActiveImage] = useState(0);

    // =========================================================
    // FETCH PRODUCT
    // =========================================================

    useEffect(() => {
        dispatch(fetchProductById(productId));

        return () => {
            dispatch(clearCurrentProduct());
        };
    }, [dispatch, productId]);

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="mx-auto max-w-6xl animate-pulse p-4 sm:p-6">
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="aspect-square rounded-2xl bg-surface-muted" />

                    <div className="space-y-3">
                        <div className="h-3 w-1/4 rounded bg-surface-muted" />
                        <div className="h-6 w-3/4 rounded bg-surface-muted" />
                        <div className="h-5 w-1/3 rounded bg-surface-muted" />
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // ERROR / NOT FOUND
    // =========================================================

    if (error || !product) {
        return (
            <div className="mx-auto max-w-6xl p-4 sm:p-6">
                <div className="rounded-2xl border border-dashed border-default bg-surface p-10 text-center">
                    <p className="text-sm text-secondary">
                        {error || "Product not found."}
                    </p>

                    <Link
                        href="/products"
                        className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        ← Back to products
                    </Link>
                </div>
            </div>
        );
    }

    // =========================================================
    // PRODUCT DATA
    // =========================================================

    const shop = getShopInfo(product);
    const category = getCategoryInfo(product);

    const effectivePrice =
        resolveEffectivePrice(product);

    const discountPercent =
        resolveDiscountPercent(product);

    const images = product.images?.length
        ? product.images
        : [];

    // =========================================================
    // LOGIN REDIRECT
    // =========================================================

    const loginRedirect = `/login?redirect=${encodeURIComponent(
        `/products/${productId}`,
    )}`;

    return (
        <div className="mx-auto max-w-6xl p-4 sm:p-6">
            {/* =====================================================
                BREADCRUMB
            ====================================================== */}

            <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted sm:text-sm">
                <Link
                    href="/products"
                    className="hover:text-secondary"
                >
                    Products
                </Link>

                {category ? (
                    <>
                        <span>/</span>

                        <span className="text-secondary">
                            {category.name}
                        </span>
                    </>
                ) : null}
            </nav>

            {/* =====================================================
                PRODUCT
            ====================================================== */}

            <div className="grid gap-6 sm:grid-cols-2 lg:gap-10">
                {/* =================================================
                    GALLERY
                ================================================== */}

                <div className="space-y-3">
                    <div className="relative aspect-square overflow-hidden rounded-2xl border border-default bg-surface-muted">
                        {images[activeImage] ? (
                            <Image
                                src={images[activeImage]}
                                alt={product.name}
                                fill
                                sizes="(max-width: 640px) 100vw, 50vw"
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-muted">
                                No image available
                            </div>
                        )}

                        {discountPercent > 0 && (
                            <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm dark:bg-rose-500">
                                {discountPercent}% OFF
                            </span>
                        )}
                    </div>

                    {/* =================================================
                        IMAGE THUMBNAILS
                    ================================================== */}

                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {images.map((img, i) => (
                                <button
                                    key={`${img}-${i}`}
                                    type="button"
                                    onClick={() =>
                                        setActiveImage(i)
                                    }
                                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${activeImage === i
                                            ? "border-zinc-900 dark:border-zinc-100"
                                            : "border-transparent"
                                        }`}
                                >
                                    <Image
                                        src={img}
                                        alt=""
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* =================================================
                    PRODUCT INFO
                ================================================== */}

                <div className="flex flex-col">
                    {/* Shop */}
                    {shop ? (
                        <Link
                            href={`/shop/${shop.slug}`}
                            className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted hover:text-secondary"
                        >
                            {shop.shopName}

                            <svg
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="h-3 w-3"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.21 4.21a.75.75 0 0 1 1.06 0l5.26 5.26a.75.75 0 0 1 0 1.06l-5.26 5.26a.75.75 0 0 1-1.06-1.06L11.94 10 7.21 5.27a.75.75 0 0 1 0-1.06Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </Link>
                    ) : null}

                    {/* Product name */}
                    <h1 className="text-xl font-semibold text-primary sm:text-2xl">
                        {product.name}
                    </h1>

                    {/* Price */}
                    <div className="mt-3 flex items-baseline gap-3">
                        <span className="text-2xl font-bold text-primary sm:text-3xl">
                            {formatPrice(effectivePrice)}
                        </span>

                        {discountPercent > 0 && (
                            <span className="text-sm text-muted line-through">
                                {formatPrice(product.price)}
                            </span>
                        )}
                    </div>

                    {/* Stock */}
                    <div className="mt-3">
                        {product.stock === 0 ? (
                            <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">
                                Out of stock
                            </span>
                        ) : product.stock <= 5 ? (
                            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                                Only {product.stock} left
                            </span>
                        ) : (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
                                In stock
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {product.description ? (
                        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-secondary">
                            {product.description}
                        </p>
                    ) : null}

                    {/* =================================================
                        ACTIONS
                    ================================================== */}

                    <div className="mt-6 flex flex-wrap gap-3">
                        {user ? (
                            <>
                                {/* Logged-in user */}
                                <AddToCartButton
                                    productId={product._id}
                                    stock={product.stock}
                                />

                                <WishlistButton
                                    productId={product._id}
                                    variant="full"
                                />
                            </>
                        ) : (
                            <>
                                {/* Guest user */}
                                <Link
                                    href={loginRedirect}
                                    className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                                >
                                    Login to add to cart
                                </Link>

                                <Link
                                    href={loginRedirect}
                                    className="inline-flex items-center justify-center rounded-lg border border-default bg-surface px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface-hover"
                                >
                                    Login to wishlist
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Guest information */}
                    {!user && (
                        <p className="mt-3 text-xs text-muted">
                            You can browse products without an account.
                            Login is required to add products to your cart
                            or wishlist.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}