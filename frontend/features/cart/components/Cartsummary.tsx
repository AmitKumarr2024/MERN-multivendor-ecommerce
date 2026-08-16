"use client";

import { useRouter } from "next/navigation";

import { useAppSelector } from "@/store/hooks";
import { selectCartItems, selectCartTotal } from "../store/cartSelectors";

function formatPrice(value: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
}

export default function CartSummary() {
    const router = useRouter();
    const items = useAppSelector(selectCartItems);
    const total = useAppSelector(selectCartTotal);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const hasUnavailableItems = items.some(
        (item) => item.product.stock === 0 || !item.product.isActive,
    );

    return (
        <div className="h-fit rounded-2xl border border-default bg-surface p-4 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold text-primary">Order summary</h2>

            <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-secondary">
                    <span>
                        Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
                    </span>
                    <span className="font-medium text-primary">{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-muted">
                    Shipping and taxes calculated at checkout.
                </p>
            </div>

            <div className="mt-4 border-t border-default pt-4">
                <div className="flex justify-between text-base font-semibold text-primary">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                </div>
            </div>

            {hasUnavailableItems && (
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                    Some items are unavailable — remove them to proceed.
                </p>
            )}

            <button
                type="button"
                onClick={() => router.push("/buyer/checkout")}
                disabled={items.length === 0 || hasUnavailableItems}
                className="mt-4 w-full rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
                Proceed to checkout
            </button>
        </div>
    );
}