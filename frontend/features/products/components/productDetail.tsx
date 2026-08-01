"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProductById, clearCurrentProduct } from "../store/Productslice";
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

interface ProductDetailProps {
    productId: string;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
    const dispatch = useAppDispatch();

    const product = useAppSelector(selectCurrentProduct);
    const loading = useAppSelector(selectProductDetailLoading);
    const error = useAppSelector(selectProductError);

    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        dispatch(fetchProductById(productId));
        return () => {
            dispatch(clearCurrentProduct());
        };
    }, [dispatch, productId]);

    if (loading) {
        return (
            <div className="mx-auto max-w-5xl animate-pulse p-4 sm:p-6">
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="aspect-square rounded-2xl bg-gray-100" />
                    <div className="space-y-3">
                        <div className="h-3 w-1/4 rounded bg-gray-100" />
                        <div className="h-6 w-3/4 rounded bg-gray-100" />
                        <div className="h-5 w-1/3 rounded bg-gray-100" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="mx-auto max-w-5xl p-4 sm:p-6">
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
                    <p className="text-sm text-gray-500">{error || "Product not found."}</p>
                    <Link
                        href="/products"
                        className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        ← Back to products
                    </Link>
                </div>
            </div>
        );
    }

    const shop = getShopInfo(product);
    const category = getCategoryInfo(product);
    const effectivePrice = resolveEffectivePrice(product);
    const discountPercent = resolveDiscountPercent(product);
    const images = product.images?.length ? product.images : [];

    return (
        <div className="mx-auto max-w-5xl p-4 sm:p-6">
            <nav className="mb-4 flex items-center gap-1.5 text-xs text-gray-400 sm:text-sm">
                <Link href="/products" className="hover:text-gray-600">
                    Products
                </Link>
                {category ? (
                    <>
                        <span>/</span>
                        <span className="text-gray-600">{category.name}</span>
                    </>
                ) : null}
            </nav>

            <div className="grid gap-6 sm:grid-cols-2 lg:gap-10">
                {/* Gallery */}
                <div className="space-y-3">
                    <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
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
                            <div className="flex h-full items-center justify-center text-sm text-gray-300">
                                No image available
                            </div>
                        )}

                        {discountPercent > 0 && (
                            <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                                {discountPercent}% OFF
                            </span>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {images.map((img, i) => (
                                <button
                                    key={img + i}
                                    type="button"
                                    onClick={() => setActiveImage(i)}
                                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                                        activeImage === i
                                            ? "border-gray-900"
                                            : "border-transparent"
                                    }`}
                                >
                                    <Image src={img} alt="" fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-col">
                    {shop ? (
                        <Link
                            href={`/shop/${shop.slug}`}
                            className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-400 hover:text-gray-600"
                        >
                            {shop.shopName}
                            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                                <path
                                    fillRule="evenodd"
                                    d="M7.21 4.21a.75.75 0 0 1 1.06 0l5.26 5.26a.75.75 0 0 1 0 1.06l-5.26 5.26a.75.75 0 1 1-1.06-1.06L11.94 10 7.21 5.27a.75.75 0 0 1 0-1.06Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </Link>
                    ) : null}

                    <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                        {product.name}
                    </h1>

                    <div className="mt-3 flex items-baseline gap-3">
                        <span className="text-2xl font-bold text-gray-900 sm:text-3xl">
                            {formatPrice(effectivePrice)}
                        </span>
                        {discountPercent > 0 && (
                            <span className="text-sm text-gray-400 line-through">
                                {formatPrice(product.price)}
                            </span>
                        )}
                    </div>

                    <div className="mt-3">
                        {product.stock === 0 ? (
                            <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                                Out of stock
                            </span>
                        ) : product.stock <= 5 ? (
                            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                Only {product.stock} left
                            </span>
                        ) : (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                                In stock
                            </span>
                        )}
                    </div>

                    {product.description ? (
                        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                            {product.description}
                        </p>
                    ) : null}

                    {/*
                      Hook point: wire this to features/cart's addToCart
                      thunk once you're rendering this on the buyer side.
                    */}
                    <button
                        type="button"
                        disabled={product.stock === 0}
                        className="mt-6 w-full rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-8"
                    >
                        {product.stock === 0 ? "Out of stock" : "Add to cart"}
                    </button>
                </div>
            </div>
        </div>
    );
}