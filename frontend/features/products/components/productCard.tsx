import Link from "next/link";
import Image from "next/image";

import type { Product } from "../types/product.types";
import {
    formatPrice,
    getShopInfo,
    resolveDiscountPercent,
    resolveEffectivePrice,
} from "../utils/productHelpers";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const shop = getShopInfo(product);
    const effectivePrice = resolveEffectivePrice(product);
    const discountPercent = resolveDiscountPercent(product);
    const hasDiscount = discountPercent > 0;
    const image = product.images?.[0];

    return (
        <Link
            href={`/products/${product._id}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
            <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
                {image ? (
                    <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-300">
                        No image
                    </div>
                )}

                {hasDiscount && (
                    <span className="absolute left-2 top-2 rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                        {discountPercent}% OFF
                    </span>
                )}

                {!product.isActive && (
                    <span className="absolute right-2 top-2 rounded-full bg-gray-900/80 px-2 py-0.5 text-[11px] font-medium text-white">
                        Hidden
                    </span>
                )}

                {product.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                        <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white">
                            Out of stock
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
                {shop ? (
                    <span className="truncate text-[11px] font-medium uppercase tracking-wide text-gray-400">
                        {shop.shopName}
                    </span>
                ) : null}

                <h3 className="line-clamp-2 text-sm font-medium text-gray-900 sm:text-base">
                    {product.name}
                </h3>

                <div className="mt-auto flex items-baseline gap-2 pt-1">
                    <span className="text-sm font-semibold text-gray-900 sm:text-base">
                        {formatPrice(effectivePrice)}
                    </span>
                    {hasDiscount && (
                        <span className="text-xs text-gray-400 line-through">
                            {formatPrice(product.price)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}