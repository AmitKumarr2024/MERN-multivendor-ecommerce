"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart, updateCartItem } from "../store/cartSlice";
import { selectCartMutatingProductId, selectCartQuantityForProduct } from "../store/cartSelectors";
import QuantityStepper from "./Quantitystepper";

interface AddToCartButtonProps {
    productId: string;
    stock: number;
    className?: string;
}

/**
 * Drop-in replacement for the plain "Add to cart" button in
 * ProductDetail — usage:
 *
 *   <AddToCartButton productId={product._id} stock={product.stock} />
 *
 * Shows a quantity stepper once the item is already in the cart,
 * so the buyer can adjust quantity right from the product page.
 */
export default function AddToCartButton({ productId, stock, className }: AddToCartButtonProps) {
    const dispatch = useAppDispatch();
    const mutatingId = useAppSelector(selectCartMutatingProductId);
    const quantityInCart = useAppSelector(selectCartQuantityForProduct(productId));

    const busy = mutatingId === productId;
    const outOfStock = stock === 0;

    const handleAdd = () => {
        dispatch(addToCart({ productId, quantity: 1 }));
    };

    const handleQuantityChange = (next: number) => {
        dispatch(updateCartItem({ productId, quantity: next }));
    };

    if (quantityInCart > 0) {
        return (
            <div className={`flex items-center gap-3 ${className ?? ""}`}>
                <QuantityStepper
                    quantity={quantityInCart}
                    max={stock}
                    onChange={handleQuantityChange}
                    disabled={busy}
                />
                <span className="text-sm text-secondary">In your cart</span>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock || busy}
            className={`w-full rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white sm:w-auto sm:px-8 ${className ?? ""}`}
        >
            {outOfStock ? "Out of stock" : busy ? "Adding..." : "Add to cart"}
        </button>
    );
}