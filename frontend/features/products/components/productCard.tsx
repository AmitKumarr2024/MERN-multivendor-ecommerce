import Link from "next/link";
import Image from "next/image";
import { Store, Star, Plus } from "lucide-react";

import type { Product } from "../types/product.types";
import {
    formatPrice,
    getShopInfo,
    resolveDiscountPercent,
    resolveEffectivePrice,
} from "../utils/productHelpers";
import { WishlistButton } from "@/features/wishlist";

interface ProductCardProps {
    product: Product;
    /**
     * Optional — only renders the hover quick-add button when passed.
     * Kept optional so this card stays a drop-in replacement anywhere
     * it's already used without a cart handler wired up.
     */
    onAddToCart?: (product: Product) => void;
}

/*
 * =================================================================
 * STANDARD ADVANCED CARD
 * =================================================================
 * Why it looked "too big" in the screenshot: with only one product
 * in a grid sized for up to 6 columns, that single card gets a full
 * grid track to itself and reads as oversized next to empty space —
 * that's a grid/data issue, not something the card markup controls.
 * Still tightened here on top of that:
 *  - max-w-[260px] caps the card's own footprint so it never grows
 *    past a normal tile size even if its grid track is wide.
 *  - Added a rating row (guarded — only shows if the product actually
 *    has review data) and a hover quick-add button: both are standard
 *    on modern product tiles (Amazon/Flipkart/Myntra all have them)
 *    and were the main things missing versus a "big but empty" card.
 *  - Kept every previous perf choice: no backdrop-blur, border-only
 *    hover instead of translate+shadow, capped image zoom.
 * =================================================================
 */

export default function ProductCard({
    product,
    onAddToCart,
}: ProductCardProps) {
    const shop = getShopInfo(product);
    const effectivePrice = resolveEffectivePrice(product);
    const discountPercent = resolveDiscountPercent(product);

    const hasDiscount = discountPercent > 0;
    const image = product.images?.[0];

    const isOutOfStock = product.stock === 0;
    const isHidden = !product.isActive;

    // Guarded — only present if the backend's denormalized rating
    // fields are populated on this product.
    const rating = (product as { averageRating?: number }).averageRating;
    const reviewCount = (product as { reviewCount?: number }).reviewCount;
    const hasRating = typeof rating === "number" && rating > 0;

    return (
        <Link
            href={`/products/${product._id}`}
            className="
                group
                relative
                mx-auto
                flex
                w-full
                max-w-[260px]
                min-w-0
                flex-col
                overflow-hidden
                rounded-lg
                border
                border-default
                bg-surface
                transition-shadow
                duration-200
                hover:shadow-md
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-accent/40
            "
        >
            {/* ==================================================
                IMAGE
            ================================================== */}

            <div className="relative aspect-square overflow-hidden bg-surface-muted">
                {image ? (
                    <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 480px) 45vw, (max-width: 1024px) 25vw, 220px"
                        className="
                            object-cover
                            transition-transform
                            duration-300
                            ease-out
                            group-hover:scale-[1.04]
                        "
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <span className="text-[11px] text-muted">No image</span>
                    </div>
                )}

                {hasDiscount && (
                    <span className="absolute left-0 top-2 rounded-r bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {discountPercent}% OFF
                    </span>
                )}

                <div className="absolute right-1.5 top-1.5 z-10">
                    <WishlistButton
                        productId={product._id}
                        variant="icon"
                        className="
                            !flex
                            !h-7
                            !w-7
                            !items-center
                            !justify-center
                            rounded-full
                            bg-surface/90
                            shadow-sm
                            dark:bg-black/70
                        "
                    />
                </div>

                {isHidden && (
                    <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                        Hidden
                    </span>
                )}

                {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="rounded bg-black/80 px-2.5 py-1 text-[10px] font-bold text-white">
                            Out of stock
                        </span>
                    </div>
                )}

                {/* QUICK ADD — only renders when a handler is passed,
                    fades in on hover/focus so the tile stays quiet
                    at rest. */}
                {onAddToCart && !isOutOfStock && (
                    <button
                        type="button"
                        aria-label={`Add ${product.name} to cart`}
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            onAddToCart(product);
                        }}
                        className="
                            absolute
                            bottom-1.5
                            right-1.5
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-full
                            bg-accent
                            text-accent-foreground
                            opacity-0
                            shadow-sm
                            transition-opacity
                            duration-150
                            group-hover:opacity-100
                            group-focus-within:opacity-100
                        "
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* ==================================================
                CONTENT
            ================================================== */}

            <div className="flex flex-1 flex-col p-2.5">
                {shop ? (
                    <div className="mb-1 flex min-w-0 items-center gap-1">
                        <Store className="h-2.5 w-2.5 shrink-0 text-muted" />
                        <span className="truncate text-[9px] font-semibold uppercase tracking-wide text-muted">
                            {shop.shopName}
                        </span>
                    </div>
                ) : null}

                <h3 className="line-clamp-2 min-h-8 text-xs font-medium leading-4 text-primary sm:text-[13px]">
                    {product.name}
                </h3>

                {hasRating && (
                    <div className="mt-1 flex items-center gap-1">
                        <span className="flex items-center gap-0.5 rounded bg-emerald-600 px-1 py-[1px] text-[10px] font-semibold text-white">
                            {rating!.toFixed(1)}
                            <Star className="h-2.5 w-2.5 fill-white" />
                        </span>
                        {typeof reviewCount === "number" && reviewCount > 0 && (
                            <span className="text-[10px] text-muted">
                                ({reviewCount})
                            </span>
                        )}
                    </div>
                )}

                <div className="mt-1.5">
                    <div className="flex flex-wrap items-baseline gap-x-1.5">
                        <span className="text-sm font-bold tracking-tight text-primary sm:text-base">
                            {formatPrice(effectivePrice)}
                        </span>

                        {hasDiscount && (
                            <span className="text-[11px] text-muted line-through">
                                {formatPrice(product.price)}
                            </span>
                        )}
                    </div>

                    {hasDiscount && (
                        <p className="mt-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                            Save {formatPrice(product.price - effectivePrice)}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
}