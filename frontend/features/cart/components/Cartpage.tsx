"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
    selectCurrentUser,
    selectAuthInitialized,
} from "@/features/auth/store/authSelector";

import {
    fetchMyCart,
    emptyCart,
} from "../store/cartSlice";

import {
    selectCartError,
    selectCartItems,
    selectCartLoading,
} from "../store/cartSelectors";

import CartItemRow from "./Cartitemrow";
import CartSummary from "./Cartsummary";

export default function CartPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();

    // Auth state
    const user = useAppSelector(selectCurrentUser);
    const authInitialized = useAppSelector(selectAuthInitialized);

    // Cart state
    const items = useAppSelector(selectCartItems);
    const loading = useAppSelector(selectCartLoading);
    const error = useAppSelector(selectCartError);

    /**
     * =========================================================
     * AUTH GUARD
     * =========================================================
     *
     * Wait until AuthInitializer has finished checking the
     * current session.
     *
     * If there is no authenticated user, redirect to login.
     */
    useEffect(() => {
        if (!authInitialized) {
            return;
        }

        if (!user) {
            router.replace("/login");
        }
    }, [authInitialized, user, router]);

    /**
     * =========================================================
     * FETCH CART
     * =========================================================
     *
     * Only fetch the cart after authentication has been
     * initialized AND a logged-in user exists.
     */
    useEffect(() => {
        if (!authInitialized || !user) {
            return;
        }

        dispatch(fetchMyCart());
    }, [authInitialized, user, dispatch]);

    /**
     * =========================================================
     * AUTH CHECK LOADING
     * =========================================================
     *
     * Don't show "empty cart" or cart errors while we are
     * still determining whether the user is logged in.
     */
    if (!authInitialized) {
        return (
            <div className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-24 animate-pulse rounded-2xl bg-surface-muted"
                    />
                ))}
            </div>
        );
    }

    /**
     * =========================================================
     * REDIRECT STATE
     * =========================================================
     *
     * User is not authenticated.
     * The useEffect above is redirecting to /login.
     */
    if (!user) {
        return (
            <div className="mx-auto max-w-7xl p-4 sm:p-6">
                <div className="flex min-h-[300px] items-center justify-center">
                    <div className="text-center">
                        <p className="text-sm text-secondary">
                            Redirecting to login...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * =========================================================
     * CART LOADING
     * =========================================================
     */
    if (loading) {
        return (
            <div className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-24 animate-pulse rounded-2xl bg-surface-muted"
                    />
                ))}
            </div>
        );
    }

    /**
     * =========================================================
     * CART ERROR
     * =========================================================
     */
    if (error) {
        return (
            <div className="mx-auto max-w-7xl p-4 sm:p-6">
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                    {error}
                </div>
            </div>
        );
    }

    /**
     * =========================================================
     * EMPTY CART
     * =========================================================
     */
    if (items.length === 0) {
        return (
            <div className="mx-auto max-w-7xl p-4 sm:p-6">
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-default bg-surface py-20 text-center">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="mb-3 h-12 w-12 text-muted"
                        aria-hidden="true"
                    >
                        <path
                            d="M3.5 5H5.5L7.3 14C7.5 15 8.4 15.7 9.4 15.7H17.3C18.3 15.7 19.1 15.1 19.4 14.1L21 8H6.2"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        <circle
                            cx="9.5"
                            cy="19"
                            r="1.3"
                            fill="currentColor"
                        />

                        <circle
                            cx="18"
                            cy="19"
                            r="1.3"
                            fill="currentColor"
                        />
                    </svg>

                    <p className="text-sm font-medium text-primary">
                        Your cart is empty
                    </p>

                    <p className="mt-1 text-sm text-secondary">
                        Start shopping to add items here.
                    </p>

                    <Link
                        href="/products"
                        className="mt-4 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    >
                        Browse products
                    </Link>
                </div>
            </div>
        );
    }

    /**
     * =========================================================
     * CART CONTENT
     * =========================================================
     */
    return (
        <div className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-primary sm:text-2xl">
                    My Cart ({items.length})
                </h1>

                <button
                    type="button"
                    onClick={() => dispatch(emptyCart())}
                    className="text-sm font-medium text-secondary hover:text-primary"
                >
                    Clear cart
                </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="rounded-2xl border border-default bg-surface p-4 shadow-sm sm:p-6">
                    {items.map((item) => (
                        <CartItemRow
                            key={item.product._id}
                            item={item}
                        />
                    ))}
                </div>

                <CartSummary />
            </div>
        </div>
    );
}