"use client";

import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/features/auth/store/authSelector";
import { addToWishlist, removeFromWishlist, fetchMyWishlist } from "../store/wishlistSlice";
import {
    selectIsWishlisted,
    selectWishlistHasLoaded,
    selectWishlistMutatingId,
} from "../store/wishlistSelectors";

interface WishlistButtonProps {
    productId: string;
    /** "icon" for the small floating heart on ProductCard, "full" for a labeled button on ProductDetail. */
    variant?: "icon" | "full";
    className?: string;
}

/**
 * Usage:
 *   ProductCard:   <WishlistButton productId={product._id} variant="icon" />
 *   ProductDetail: <WishlistButton productId={product._id} variant="full" />
 *
 * Lazily loads the wishlist once (on first mount anywhere in the tree)
 * so every card doesn't trigger its own fetch — membership is then a
 * cheap local lookup via selectIsWishlisted.
 */
export default function WishlistButton({ productId, variant = "icon", className }: WishlistButtonProps) {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const hasLoaded = useAppSelector(selectWishlistHasLoaded);
    const wishlisted = useAppSelector(selectIsWishlisted(productId));
    const mutatingId = useAppSelector(selectWishlistMutatingId);

    const busy = mutatingId === productId;

    useEffect(() => {
        if (isAuthenticated && !hasLoaded) {
            dispatch(fetchMyWishlist());
        }
    }, [dispatch, isAuthenticated, hasLoaded]);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated || busy) return;

        if (wishlisted) {
            dispatch(removeFromWishlist(productId));
        } else {
            dispatch(addToWishlist({ productId }));
        }
    };

    if (variant === "full") {
        return (
            <button
                type="button"
                onClick={handleToggle}
                disabled={busy}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                    wishlisted
                        ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
                        : "border-default text-primary hover:bg-surface-hover"
                } ${className ?? ""}`}
            >
                <HeartIcon filled={wishlisted} className="h-4 w-4" />
                {wishlisted ? "Wishlisted" : "Add to wishlist"}
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={handleToggle}
            disabled={busy}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-transform hover:scale-105 disabled:opacity-50 dark:bg-zinc-900/90 ${className ?? ""}`}
        >
            <HeartIcon
                filled={wishlisted}
                className={`h-4 w-4 ${wishlisted ? "text-red-600 dark:text-red-400" : "text-zinc-500 dark:text-zinc-400"}`}
            />
        </button>
    );
}

function HeartIcon({ filled, className }: { filled: boolean; className?: string }) {
    return (
        <svg
            viewBox="0 0 20 20"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={filled ? 0 : 1.7}
            className={className}
        >
            <path d="M10 17.3 3.5 11c-2-2-2-5.2 0-7.1 2-1.9 5-1.7 6.5.5 1.5-2.2 4.5-2.4 6.5-.5 2 1.9 2 5.1 0 7.1L10 17.3Z" />
        </svg>
    );
}