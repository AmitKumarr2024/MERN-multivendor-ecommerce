import type { RootState } from "@/store/store";

export const selectWishlist = (state: RootState) => state.wishlist.wishlist;
export const selectWishlistProducts = (state: RootState) => state.wishlist.wishlist?.products ?? [];
export const selectWishlistCount = (state: RootState) => state.wishlist.productIds.length;

export const selectWishlistHasLoaded = (state: RootState) => state.wishlist.hasLoaded;
export const selectWishlistLoading = (state: RootState) => state.wishlist.loading;
export const selectWishlistMutatingId = (state: RootState) => state.wishlist.mutatingProductId;
export const selectWishlistError = (state: RootState) => state.wishlist.error;
export const selectWishlistSuccessMessage = (state: RootState) => state.wishlist.successMessage;

/** Cheap membership check for a single product - no API call, reads the cached id set. */
export const selectIsWishlisted = (productId: string) => (state: RootState) =>
    state.wishlist.productIds.includes(productId);