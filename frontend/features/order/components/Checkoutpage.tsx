"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { fetchMyCart } from "@/features/cart/store/cartSlice";
import { selectCartItems, selectCartTotal, selectCartLoading } from "@/features/cart/store/cartSelectors";
import {

    selectOrderError,
    selectOrderLoading,
    selectOrderSuccessMessage,
} from "../store/orderSelectors";
import { checkout } from "../store/orderSlice";
import type { PaymentMethod, ShippingAddress } from "../types/order.types";
// NEW: shipping cost / delivery-days preview before placing the order
import { DeliveryEstimate } from "@/features/logistics";

const emptyAddress: ShippingAddress = {
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
};

function formatPrice(value: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * `product.shop` comes back either as a populated ProductShop object
 * ({ _id, shopName, slug, logo }) or as a raw ObjectId string, depending
 * on which endpoint populated the cart. This normalizes either shape to
 * just the shop id string, which is all DeliveryEstimate needs.
 */
function getShopId(shop: { _id: string } | string): string {
    return typeof shop === "string" ? shop : shop._id;
}

export default function CheckoutPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const items = useAppSelector(selectCartItems);
    const cartTotal = useAppSelector(selectCartTotal);
    const cartLoading = useAppSelector(selectCartLoading);

    const orderLoading = useAppSelector(selectOrderLoading);
    const orderError = useAppSelector(selectOrderError);
    const successMessage = useAppSelector(selectOrderSuccessMessage);

    const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
    const [localError, setLocalError] = useState<string | null>(null);
    const [placed, setPlaced] = useState(false);

    useEffect(() => {
        dispatch(fetchMyCart());
    }, [dispatch]);

    const update = (key: keyof ShippingAddress, value: string) => {
        setAddress((a) => ({ ...a, [key]: value }));
    };

    const hasUnavailableItems = items.some(
        (item) => item.product.stock === 0 || !item.product.isActive,
    );

    // Cart can be multi-vendor (backend splits checkout into one order per
    // shop), so collect the distinct shop ids present in the cart and show
    // one DeliveryEstimate per shop rather than assuming a single seller.
    const uniqueShopIds = Array.from(
        new Set(items.map((item) => getShopId(item.product.shop))),
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!address.phone.trim() || !address.street.trim() || !address.city.trim()) {
            setLocalError("Phone, street, and city are required.");
            return;
        }

        const result = await dispatch(checkout({ shippingAddress: address, paymentMethod }));
        if (checkout.fulfilled.match(result)) {
            setPlaced(true);
            setTimeout(() => router.push("/buyer/orders"), 1500);
        }
    };

    if (placed) {
        return (
            <div className="mx-auto max-w-xl p-6 text-center">
                <div className="rounded-2xl border border-default bg-surface p-10 shadow-sm">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/40">
                        <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-6 w-6 text-green-600 dark:text-green-400"
                        >
                            <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm3.7 5.7-4.5 4.5-2.9-2.9 1.06-1.06L9.2 9.14l3.44-3.44 1.06 1Z" />
                        </svg>
                    </div>
                    <p className="text-lg font-semibold text-primary">
                        {successMessage ?? "Order placed successfully!"}
                    </p>
                    <p className="mt-1 text-sm text-secondary">Redirecting to your orders...</p>
                </div>
            </div>
        );
    }

    if (!cartLoading && items.length === 0) {
        return (
            <div className="mx-auto max-w-xl p-6 text-center">
                <div className="rounded-2xl border border-dashed border-default bg-surface p-10">
                    <p className="text-sm text-secondary">Your cart is empty.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6">
            <h1 className="mb-4 text-xl font-semibold text-primary sm:text-2xl">Checkout</h1>

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="rounded-2xl border border-default bg-surface p-4 shadow-sm sm:p-6">
                        <h2 className="mb-4 text-base font-semibold text-primary">
                            Shipping address
                        </h2>

                        {(orderError || localError) && (
                            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                                {localError || orderError}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1.5 block text-sm font-medium text-primary">
                                    Full name
                                </label>
                                <input
                                    type="text"
                                    value={address.fullName}
                                    onChange={(e) => update("fullName", e.target.value)}
                                    className="w-full rounded-lg border border-default bg-surface px-3 py-2.5 text-sm focus:border-zinc-900 focus:outline-none dark:focus:border-zinc-100"
                                />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1.5 block text-sm font-medium text-primary">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={address.phone}
                                    onChange={(e) => update("phone", e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-default bg-surface px-3 py-2.5 text-sm focus:border-zinc-900 focus:outline-none dark:focus:border-zinc-100"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-primary">
                                    Street address
                                </label>
                                <input
                                    type="text"
                                    value={address.street}
                                    onChange={(e) => update("street", e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-default bg-surface px-3 py-2.5 text-sm focus:border-zinc-900 focus:outline-none dark:focus:border-zinc-100"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-primary">
                                    City
                                </label>
                                <input
                                    type="text"
                                    value={address.city}
                                    onChange={(e) => update("city", e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-default bg-surface px-3 py-2.5 text-sm focus:border-zinc-900 focus:outline-none dark:focus:border-zinc-100"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-primary">
                                    State
                                </label>
                                <input
                                    type="text"
                                    value={address.state}
                                    onChange={(e) => update("state", e.target.value)}
                                    className="w-full rounded-lg border border-default bg-surface px-3 py-2.5 text-sm focus:border-zinc-900 focus:outline-none dark:focus:border-zinc-100"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-primary">
                                    Pincode
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={address.pincode}
                                    onChange={(e) => update("pincode", e.target.value)}
                                    className="w-full rounded-lg border border-default bg-surface px-3 py-2.5 text-sm focus:border-zinc-900 focus:outline-none dark:focus:border-zinc-100"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-primary">
                                    Country
                                </label>
                                <input
                                    type="text"
                                    value={address.country}
                                    onChange={(e) => update("country", e.target.value)}
                                    className="w-full rounded-lg border border-default bg-surface px-3 py-2.5 text-sm focus:border-zinc-900 focus:outline-none dark:focus:border-zinc-100"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-default bg-surface p-4 shadow-sm sm:p-6">
                        <h2 className="mb-3 text-base font-semibold text-primary">
                            Payment method
                        </h2>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 rounded-lg border border-default p-3 text-sm">
                                <input
                                    type="radio"
                                    checked={paymentMethod === "cod"}
                                    onChange={() => setPaymentMethod("cod")}
                                />
                                <span className="text-primary">Cash on Delivery</span>
                            </label>
                            <label className="flex items-center gap-2 rounded-lg border border-default p-3 text-sm opacity-50">
                                <input type="radio" disabled />
                                <span className="text-secondary">
                                    Pay online (coming soon)
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* NEW: shipping cost / delivery-time preview, one per
                        distinct shop in the cart (backend splits checkout into
                        one order per shop, so shipping is quoted per shop too). */}
                    {uniqueShopIds.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-sm font-semibold text-primary">
                                Delivery estimate
                            </h2>
                            {uniqueShopIds.map((shopId) => (
                                <DeliveryEstimate key={shopId} shopId={shopId} />
                            ))}
                        </div>
                    )}
                </form>

                {/* Order summary */}
                <div className="h-fit rounded-2xl border border-default bg-surface p-4 shadow-sm sm:p-6">
                    <h2 className="text-base font-semibold text-primary">Order summary</h2>
                    <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
                        {items.map((item) => (
                            <li key={item.product._id} className="flex justify-between text-sm">
                                <span className="text-secondary">
                                    {item.product.name} × {item.quantity}
                                </span>
                                <span className="text-primary">{formatPrice(item.subtotal)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-3 border-t border-default pt-3">
                        <div className="flex justify-between text-base font-semibold text-primary">
                            <span>Total</span>
                            <span>{formatPrice(cartTotal)}</span>
                        </div>
                    </div>

                    {hasUnavailableItems && (
                        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                            Some items are unavailable — go back to cart to remove them.
                        </p>
                    )}

                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={orderLoading || hasUnavailableItems || items.length === 0}
                        className="mt-4 w-full rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    >
                        {orderLoading ? "Placing order..." : "Place order"}
                    </button>
                </div>
            </div>
        </div>
    );
}