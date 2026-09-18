"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowLeft,
    ArrowRight,
    Heart,
    ShieldCheck,
    Truck,
} from "lucide-react";

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
    resolveVariantDiscountPercent,
    resolveVariantOriginalPrice,
    resolveVariantPrice,
} from "../utils/productHelpers";

import AddToCartButton from "@/features/cart/components/Addtocartbutton";
import { WishlistButton } from "@/features/wishlist";
import { ReviewList } from "@/features/reviews";

import VariantSelector from "./VariantSelector";
import SpecificationsTable from "./SpecificationsTable";
import RelatedProducts from "./RelatedProducts";

import RatingStars from "@/features/reviews/components/RatingStars";

interface ProductDetailProps {
    productId: string;
}

export default function ProductDetail({
    productId,
}: ProductDetailProps) {
    const dispatch = useAppDispatch();

    const user = useAppSelector(selectCurrentUser);
    const product = useAppSelector(selectCurrentProduct);
    const loading = useAppSelector(selectProductDetailLoading);
    const error = useAppSelector(selectProductError);

    const [activeImage, setActiveImage] = useState(0);
    const [selectedVariantId, setSelectedVariantId] =
        useState<string | null>(null);

    /* --------------------------------------------------
       FETCH PRODUCT
    -------------------------------------------------- */

    useEffect(() => {
        dispatch(fetchProductById(productId));

        return () => {
            dispatch(clearCurrentProduct());
        };
    }, [dispatch, productId]);

    /* --------------------------------------------------
       DEFAULT VARIANT
    -------------------------------------------------- */

    useEffect(() => {
        if (
            product?.hasVariants &&
            product.variants?.length &&
            !selectedVariantId
        ) {
            const firstInStock =
                product.variants.find((v) => v.stock > 0) ??
                product.variants[0];

            setSelectedVariantId(firstInStock._id);
        }
    }, [product, selectedVariantId]);

    /* --------------------------------------------------
       SELECTED VARIANT
    -------------------------------------------------- */

    const selectedVariant = useMemo(
        () =>
            product?.variants?.find(
                (v) => v._id === selectedVariantId,
            ) ?? null,
        [product, selectedVariantId],
    );

    /* --------------------------------------------------
       RESET IMAGE WHEN VARIANT CHANGES
    -------------------------------------------------- */

    useEffect(() => {
        setActiveImage(0);
    }, [selectedVariantId]);

    /* --------------------------------------------------
       LOADING
    -------------------------------------------------- */

    if (loading) {
        return (
            <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="animate-pulse">
                        {/* Breadcrumb */}
                        <div className="mb-8 h-4 w-40 rounded-full bg-surface-muted" />

                        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:gap-14">
                            {/* Gallery */}
                            <div>
                                <div className="aspect-square rounded-3xl bg-surface-muted" />

                                <div className="mt-4 flex gap-3">
                                    <div className="h-20 w-20 rounded-xl bg-surface-muted" />
                                    <div className="h-20 w-20 rounded-xl bg-surface-muted" />
                                    <div className="h-20 w-20 rounded-xl bg-surface-muted" />
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-6">
                                <div className="h-4 w-32 rounded bg-surface-muted" />
                                <div className="h-10 w-4/5 rounded bg-surface-muted" />
                                <div className="h-5 w-44 rounded bg-surface-muted" />
                                <div className="h-12 w-40 rounded bg-surface-muted" />
                                <div className="h-5 w-28 rounded bg-surface-muted" />
                                <div className="h-20 w-full rounded bg-surface-muted" />
                                <div className="h-12 w-full rounded-xl bg-surface-muted" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* --------------------------------------------------
       ERROR / NOT FOUND
    -------------------------------------------------- */

    if (error || !product) {
        return (
            <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-dashed border-default bg-surface px-6">
                        <div className="max-w-sm text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
                                <span className="text-lg text-muted">
                                    !
                                </span>
                            </div>

                            <h2 className="mt-4 text-base font-semibold text-primary">
                                Product unavailable
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-secondary">
                                {error ||
                                    "The product you're looking for could not be found."}
                            </p>

                            <Link
                                href="/products"
                                className="
                                    mt-5 inline-flex items-center
                                    gap-2 rounded-xl border
                                    border-default bg-surface
                                    px-4 py-2.5 text-sm
                                    font-medium text-primary
                                    transition-colors
                                    hover:bg-surface-hover
                                "
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to products
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* --------------------------------------------------
       PRODUCT DATA
    -------------------------------------------------- */

    const shop = getShopInfo(product);
    const category = getCategoryInfo(product);

    const effectivePrice = resolveVariantPrice(
        product,
        selectedVariant,
    );

    const discountPercent = resolveVariantDiscountPercent(
        product,
        selectedVariant,
    );

    const originalPrice = resolveVariantOriginalPrice(
        product,
        selectedVariant,
    );

    const images =
        selectedVariant?.images &&
            selectedVariant.images.length > 0
            ? selectedVariant.images
            : product.images?.length
                ? product.images
                : [];

    const currentStock = product.hasVariants
        ? (selectedVariant?.stock ?? 0)
        : product.stock;

    const loginRedirect = `/login?redirect=${encodeURIComponent(
        `/products/${productId}`,
    )}`;

    const canAddToCart =
        !product.hasVariants ||
        (!!selectedVariant && selectedVariant.stock > 0);

    const hasSpecs = !!product.specifications?.length;

    /* --------------------------------------------------
       UI
    -------------------------------------------------- */

    return (
        <div className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mx-auto max-w-7xl">
                {/* ==================================================
                    BREADCRUMB
                ================================================== */}

                <nav className="mb-7 flex min-w-0 items-center gap-2 text-sm">
                    <Link
                        href="/products"
                        className="shrink-0 text-muted transition-colors hover:text-primary"
                    >
                        Products
                    </Link>

                    <span className="text-muted">/</span>

                    <span className="truncate text-secondary">
                        {category?.name || "Product"}
                    </span>
                </nav>

                {/* ==================================================
                    MAIN PRODUCT
                ================================================== */}

                <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:gap-14">
                    {/* ==================================================
                        LEFT — IMAGE GALLERY
                    ================================================== */}

                    <div className="min-w-0">
                        <div className="relative">
                            {/* Main image */}
                            <div className="group relative aspect-square overflow-hidden rounded-3xl bg-surface-muted">
                                {images[activeImage] ? (
                                    <Image
                                        src={images[activeImage]}
                                        alt={product.name}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 58vw"
                                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                                        priority
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-muted">
                                        No image available
                                    </div>
                                )}

                                {/* Discount badge */}
                                {discountPercent > 0 && (
                                    <div className="absolute left-4 top-4 rounded-full bg-rose-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                                        {discountPercent}% OFF
                                    </div>
                                )}

                                {/* Wishlist */}
                                {user && (
                                    <div className="absolute right-4 top-4">
                                        <WishlistButton
                                            productId={product._id}
                                            variant="icon"
                                        />
                                    </div>
                                )}

                                {/* Image navigation */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveImage(
                                                    (prev) =>
                                                        prev === 0
                                                            ? images.length -
                                                            1
                                                            : prev - 1,
                                                )
                                            }
                                            aria-label="Previous image"
                                            className="
                                                absolute left-3 top-1/2
                                                flex h-9 w-9 -translate-y-1/2
                                                items-center justify-center
                                                rounded-full
                                                bg-surface/90
                                                text-primary
                                                shadow-md
                                                backdrop-blur
                                                transition-all
                                                hover:scale-105
                                            "
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveImage(
                                                    (prev) =>
                                                        prev ===
                                                            images.length -
                                                            1
                                                            ? 0
                                                            : prev + 1,
                                                )
                                            }
                                            aria-label="Next image"
                                            className="
                                                absolute right-3 top-1/2
                                                flex h-9 w-9 -translate-y-1/2
                                                items-center justify-center
                                                rounded-full
                                                bg-surface/90
                                                text-primary
                                                shadow-md
                                                backdrop-blur
                                                transition-all
                                                hover:scale-105
                                            "
                                        >
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Image counter */}
                            {images.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-surface/90 px-3 py-1 text-[11px] font-medium text-secondary shadow-sm backdrop-blur">
                                    {activeImage + 1} / {images.length}
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="mt-6 flex gap-3 overflow-x-auto pb-1">
                                {images.map((img, i) => (
                                    <button
                                        key={`${img}-${i}`}
                                        type="button"
                                        onClick={() =>
                                            setActiveImage(i)
                                        }
                                        aria-label={`View image ${i + 1}`}
                                        aria-current={
                                            activeImage === i
                                        }
                                        className={`
                                            relative h-[72px] w-[72px]
                                            shrink-0 overflow-hidden
                                            rounded-xl
                                            bg-surface-muted
                                            m-1
                                            transition-all
                                            sm:h-20 sm:w-20
                                            ${activeImage === i
                                                ? "ring-2 ring-accent ring-offset-2 ring-offset-surface"
                                                : "opacity-65 hover:opacity-100"
                                            }
                                        `}
                                    >
                                        <Image
                                            src={img}
                                            alt=""
                                            fill
                                            sizes="40px"
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ==================================================
                        RIGHT — PRODUCT INFORMATION
                    ================================================== */}

                    <div className="min-w-0">
                        <div className="space-y-6">
                            {/* SHOP */}
                            {shop && (
                                <Link
                                    href={`/shop/${shop.slug}`}
                                    className="
                                        inline-flex items-center gap-2
                                        text-sm font-medium
                                        text-secondary
                                        transition-colors
                                        hover:text-primary
                                    "
                                >
                                    <span className="max-w-[220px] truncate">
                                        {shop.shopName}
                                    </span>

                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            )}

                            {/* TITLE + RATING */}
                            <div>
                                <h1 className="text-2xl font-semibold leading-tight tracking-tight text-primary sm:text-3xl lg:text-[2.15rem]">
                                    {product.name}
                                </h1>

                                {(product.reviewCount ?? 0) > 0 && (
                                    <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <RatingStars
                                                value={
                                                    product.averageRating ??
                                                    0
                                                }
                                                size="sm"
                                            />

                                            <span className="text-sm font-semibold text-primary">
                                                {(
                                                    product.averageRating ??
                                                    0
                                                ).toFixed(1)}
                                            </span>
                                        </div>

                                        <span className="text-muted">
                                            ·
                                        </span>

                                        <span className="text-sm text-secondary">
                                            {product.reviewCount}{" "}
                                            {product.reviewCount === 1
                                                ? "review"
                                                : "reviews"}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* PRICE BLOCK */}
                            <div className="rounded-2xl bg-surface-muted/60 p-4 sm:p-5">
                                <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                                    <span className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                                        {formatPrice(effectivePrice)}
                                    </span>

                                    {discountPercent > 0 && (
                                        <span className="pb-1 text-sm text-muted line-through">
                                            {formatPrice(originalPrice)}
                                        </span>
                                    )}

                                    {discountPercent > 0 && (
                                        <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                            Save {discountPercent}%
                                        </span>
                                    )}
                                </div>

                                <p className="mt-1.5 text-xs text-muted">
                                    Inclusive of applicable taxes
                                </p>
                            </div>

                            {/* STOCK */}
                            <div>
                                {currentStock === 0 ? (
                                    <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                        Out of stock
                                    </div>
                                ) : currentStock <= 5 ? (
                                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                        Only {currentStock} left
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                        In stock
                                    </div>
                                )}
                            </div>

                            {/* DESCRIPTION */}
                            {product.description && (
                                <div>
                                    <p className="text-sm leading-7 text-secondary">
                                        {product.description}
                                    </p>
                                </div>
                            )}

                            {/* VARIANTS */}
                            {product.hasVariants &&
                                product.variants &&
                                product.variants.length > 0 && (
                                    <div className="border-t border-default pt-6">
                                        <VariantSelector
                                            variants={
                                                product.variants
                                            }
                                            selectedVariantId={
                                                selectedVariantId
                                            }
                                            onSelect={
                                                setSelectedVariantId
                                            }
                                        />
                                    </div>
                                )}

                            {/* PURCHASE ACTIONS */}
                            <div className="border-t border-default pt-6">
                                {user ? (
                                    <div className="space-y-3">
                                        <div className="min-w-0">
                                            <AddToCartButton
                                                productId={
                                                    product._id
                                                }
                                                stock={currentStock}
                                                variantId={
                                                    selectedVariantId
                                                }
                                                disabled={
                                                    !canAddToCart
                                                }
                                            />
                                        </div>

                                        <WishlistButton
                                            productId={product._id}
                                            variant="full"
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Link
                                            href={loginRedirect}
                                            className="
                                                flex w-full
                                                items-center
                                                justify-center
                                                rounded-xl
                                                bg-primary
                                                px-5 py-3.5
                                                text-sm font-semibold
                                                text-surface
                                                transition-all
                                                hover:opacity-90
                                                active:scale-[0.99]
                                            "
                                        >
                                            Login to add to cart
                                        </Link>

                                        <Link
                                            href={loginRedirect}
                                            className="
                                                flex w-full
                                                items-center
                                                justify-center
                                                gap-2
                                                rounded-xl
                                                border
                                                border-default
                                                bg-surface
                                                px-5 py-3.5
                                                text-sm font-semibold
                                                text-primary
                                                transition-colors
                                                hover:bg-surface-hover
                                            "
                                        >
                                            <Heart className="h-4 w-4" />
                                            Add to wishlist
                                        </Link>

                                        <p className="px-1 text-xs leading-5 text-muted">
                                            Login is required to add
                                            products to your cart or
                                            wishlist.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* BENEFITS */}
                            <div className="grid grid-cols-1 divide-y divide-default rounded-2xl border border-default sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                                <div className="flex items-center gap-3 p-4">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted">
                                        <Truck className="h-4 w-4 text-primary" />
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold text-primary">
                                            Delivery
                                        </p>

                                        <p className="mt-0.5 text-[11px] text-muted">
                                            Check availability at checkout
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted">
                                        <ShieldCheck className="h-4 w-4 text-primary" />
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold text-primary">
                                            Secure purchase
                                        </p>

                                        <p className="mt-0.5 text-[11px] text-muted">
                                            Safe and reliable checkout
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* SPECIFICATIONS */}
                            {hasSpecs && (
                                <div className="pt-1">
                                    <SpecificationsTable
                                        specs={
                                            product.specifications!
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ==================================================
                    REVIEWS
                ================================================== */}

                <section className="mt-16 border-t border-default pt-10 sm:mt-20 sm:pt-12">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold tracking-tight text-primary sm:text-2xl">
                            Customer reviews
                        </h2>

                        <p className="mt-1 text-sm text-muted">
                            See what other customers think about this
                            product.
                        </p>
                    </div>

                    <ReviewList
                        productId={product._id}
                        averageRating={
                            product.averageRating ?? 0
                        }
                        reviewCount={product.reviewCount ?? 0}
                    />
                </section>

                {/* ==================================================
                    RELATED PRODUCTS
                ================================================== */}

                <section className="mt-16 border-t border-default pt-10 sm:mt-20 sm:pt-12">
                    <RelatedProducts productId={product._id} />
                </section>
            </div>
        </div>
    );
}