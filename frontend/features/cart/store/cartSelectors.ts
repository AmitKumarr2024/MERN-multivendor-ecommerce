import type { RootState } from "@/store/store";

export const selectCart = (state: RootState) => state.cart.cart;
export const selectCartItems = (state: RootState) => state.cart.cart?.items ?? [];
export const selectCartTotal = (state: RootState) => state.cart.cart?.cartTotal ?? 0;

/** Total quantity across all items — what the navbar cart badge should show. */
export const selectCartItemCount = (state: RootState) =>
    state.cart.cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

export const selectCartLoading = (state: RootState) => state.cart.loading;
export const selectCartMutatingProductId = (state: RootState) => state.cart.mutatingProductId;
export const selectCartError = (state: RootState) => state.cart.error;
export const selectCartSuccessMessage = (state: RootState) => state.cart.successMessage;

/** Quick lookup: is this product already in the cart, and at what quantity? */
export const selectCartQuantityForProduct = (productId: string) => (state: RootState) =>
    state.cart.cart?.items.find((item) => item.product._id === productId)?.quantity ?? 0;