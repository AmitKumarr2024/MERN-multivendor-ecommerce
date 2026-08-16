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
    const image = item.product.images?.[0];
    const outOfStock = item.product.stock === 0 || !item.product.isActive;
    const overStock = item.quantity > item.product.stock && item.product.stock > 0;

    const handleQuantityChange = (next: number) => {
        dispatch(updateCartItem({ productId: item.product._id, quantity: next }));
    };

    const handleRemove = () => {
        dispatch(removeCartItem(item.product._id));
    };

    return (
        <div className="flex gap-3 border-b border-default py-4 last:border-0 sm:gap-4">
            <Link
                href={`/products/${item.product._id}`}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-muted sm:h-24 sm:w-24"
            >
                {image ? (
                    <Image src={image} alt={item.product.name} fill className="object-cover" />
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
                    <p className="mt-0.5 text-xs text-muted">{item.product.shop.shopName}</p>

                    {outOfStock ? (
                        <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                            No longer available
                        </p>
                    ) : overStock ? (
                        <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                            Only {item.product.stock} left — reduce quantity
                        </p>
                    ) : null}
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <QuantityStepper
                        quantity={item.quantity}
                        max={item.product.stock || 1}
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