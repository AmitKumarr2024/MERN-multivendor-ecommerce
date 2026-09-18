"use client";

import Link from "next/link";
import Image from "next/image";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeCartItem, updateCartItem } from "../store/cartSlice";
import { selectCartMutatingProductId } from "../store/cartSelectors";
import type { CartItem } from "../types/cart.types";
import QuantityStepper from "./Quantitystepper";

interface CartItemRowProps {
    item: CartItem;
}

function formatPrice(value: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
}

export default function CartItemRow({ item }: CartItemRowProps) {
    const dispatch = useAppDispatch();
    const mutatingId = useAppSelector(selectCartMutatingProductId);

    const busy = mutatingId === item.product._id;
    const image =
        item.variant?.images?.[0] ?? item.product.images?.[0];

    // Stock check must use the variant's own stock when this line item
    // is a specific variant - the flat product.stock is irrelevant once
    // hasVariants is true (mirrors the backend's resolveStockInfo logic).
    const availableStock = item.product.hasVariants
        ? (item.variant
            ? // variant stock isn't in the populated `product.variants`
            // shape returned by cart's buildCartResponse - fall back to
            // whatever the backend already validated at add-time if a
            // dedicated field isn't present.
            (item as any).availableStock ?? item.product.stock
            : 0)
        : item.product.stock;

    const outOfStock = availableStock === 0 || !item.product.isActive;
    const overStock =
        item.quantity > availableStock && availableStock > 0;

    const variantLabel = item.variant
        ? [item.variant.color, item.variant.size]
            .filter(Boolean)
            .join(" / ")
        : null;

    const handleQuantityChange = (next: number) => {
        dispatch(
            updateCartItem({
                productId: item.product._id,
                quantity: next,
                variantId: item.variantId,
            }),
        );
    };

    const handleRemove = () => {
        dispatch(
            removeCartItem({productId: item.product._id,
                variantId: item.variantId,
            }),
        );
    };

    return (
        <div className="flex gap-3 border-b border-default py-4 last:border-0 sm:gap-4">
            <Link
                href={`/products/${item.product._id}`}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-muted sm:h-24 sm:w-24"
            >
                {image ? (
                    <Image
                        src={image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-muted">
                        No image
                    </div>
                )}
            </Link>

            <div className="flex flex-1 flex-col justify-between">
                <div>
                    <Link
                        href={`/products/${item.product._id}`}
                        className="line-clamp-2 text-sm font-medium text-primary hover:underline sm:text-base"
                    >
                        {item.product.name}
                    </Link>

                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <p className="text-xs text-muted">
                            {item.product.shop.shopName}
                        </p>

                        {variantLabel && (
                            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-secondary">
                                {variantLabel}
                            </span>
                        )}
                    </div>

                    {outOfStock ? (
                        <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                            No longer available
                        </p>
                    ) : overStock ? (
                        <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                            Only {availableStock} left — reduce quantity
                        </p>
                    ) : null}
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <QuantityStepper
                        quantity={item.quantity}
                        max={availableStock || 1}
                        onChange={handleQuantityChange}
                        disabled={busy || outOfStock}
                    />

                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-primary sm:text-base">
                            {formatPrice(item.subtotal)}
                        </span>
                        <button
                            type="button"
                            onClick={handleRemove}
                            disabled={busy}
                            className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}