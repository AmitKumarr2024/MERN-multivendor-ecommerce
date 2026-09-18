"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart, updateCartItem } from "../store/cartSlice";
import {
    selectCartMutatingProductId,
    selectCartQuantityForProduct,
} from "../store/cartSelectors";
import QuantityStepper from "./Quantitystepper";

interface AddToCartButtonProps {
    productId: string;
    stock: number;
    className?: string;
    variantId?: string | null;
    disabled?: boolean;
}

/**
 * Drop-in replacement for the plain "Add to cart" button in
 * ProductDetail — usage:
 *
 *   <AddToCartButton productId={product._id} stock={product.stock} />
 *
 *   // variant product:
 *   <AddToCartButton
 *       productId={product._id}
 *       stock={selectedVariant?.stock ?? 0}
 *       variantId={selectedVariantId}
 *       disabled={!canAddToCart}
 *   />
 *
 * Shows a quantity stepper once the item is already in the cart,
 * so the buyer can adjust quantity right from the product page.
 *
 * IMPORTANT: `variantId` must be threaded through to both the
 * `addToCart` dispatch AND the `selectCartQuantityForProduct`
 * lookup — otherwise a variant product silently sends
 * variantId: null to the backend (which rejects it), or shows
 * the wrong "already in cart" quantity by merging separate
 * variants of the same product into one count.
 */
export default function AddToCartButton({
    productId,
    stock,
    className,
    variantId = null,
    disabled = false,
}: AddToCartButtonProps) {
    const dispatch = useAppDispatch();
    const mutatingId = useAppSelector(selectCartMutatingProductId);

    // NOTE: if selectCartQuantityForProduct doesn't currently accept a
    // second (variantId) argument, it needs to be updated too - otherwise
    // two different variants of the same product will be reported as
    // having the same "already in cart" quantity. Passing it here is a
    // no-op today but is the correct call once the selector is fixed.
    const quantityInCart = useAppSelector(
        selectCartQuantityForProduct(productId, variantId),
    );

    const busy = mutatingId === productId;
    const outOfStock = stock === 0;
    const isDisabled = disabled || outOfStock || busy;

    const handleAdd = () => {
        dispatch(
            addToCart({
                productId,
                quantity: 1,
                variantId,
            }),
        );
    };

    const handleQuantityChange = (next: number) => {
        dispatch(
            updateCartItem({
                productId,
                quantity: next,
                variantId,
            }),
        );
    };

    if (quantityInCart > 0) {
        return (
            <div
                className={`flex flex-wrap items-center gap-3 ${className ?? ""}`}
            >
                <QuantityStepper
                    quantity={quantityInCart}
                    max={stock}
                    onChange={handleQuantityChange}
                    disabled={busy}
                />
                <span className="text-sm text-secondary">
                    In your cart
                </span>
            </div>
        );
    }

    const buttonLabel = outOfStock
        ? "Out of stock"
        : busy
            ? "Adding..."
            : disabled
                ? "Select an option"
                : "Add to cart";

    return (
        <button
            type="button"
            onClick={handleAdd}
            disabled={isDisabled}
            className={`
                w-full rounded-xl bg-zinc-900 px-5 py-3
                text-sm font-medium text-white shadow-sm
                transition-colors
                hover:bg-zinc-800
                disabled:cursor-not-allowed disabled:opacity-40
                dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white
                sm:w-auto sm:px-8
                ${className ?? ""}
            `}
        >
            {buttonLabel}
        </button>
    );
}