import type { RootState } from "@/store/store";

export const selectCart = (state: RootState) => state.cart.cart;
export const selectCartItems = (state: RootState) =>
  state.cart.cart?.items ?? [];
export const selectCartTotal = (state: RootState) =>
  state.cart.cart?.cartTotal ?? 0;

/** Total quantity across all items — what the navbar cart badge should show. */
export const selectCartItemCount = (state: RootState) =>
  state.cart.cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

export const selectCartLoading = (state: RootState) => state.cart.loading;
export const selectCartMutatingProductId = (state: RootState) =>
  state.cart.mutatingProductId;
export const selectCartError = (state: RootState) => state.cart.error;
export const selectCartSuccessMessage = (state: RootState) =>
  state.cart.successMessage;

/**
 * Quick lookup: is this product (or this specific variant) already in the
 * cart, and at what quantity?
 *
 * IMPORTANT: pass `variantId` for variant products. Without it, two
 * different variants of the same product (e.g. "1 kg" and "5 kg") would
 * incorrectly be reported as sharing one merged quantity, since both
 * share the same product._id and only variantId tells them apart.
 */
export const selectCartQuantityForProduct =
  (productId: string, variantId: string | null = null) =>
  (state: RootState) =>
    state.cart.cart?.items.find(
      (item) =>
        item.product._id === productId &&
        String(item.variantId ?? "") === String(variantId ?? ""),
    )?.quantity ?? 0;
