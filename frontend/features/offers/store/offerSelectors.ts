import type { RootState } from "@/store/store";

export const selectShopOffers = (state: RootState) => state.offers.shopOffers;
export const selectPublicOffers = (shopId: string) => (state: RootState) =>
  state.offers.publicOffersByShop[shopId] ?? [];
export const selectCouponResult = (state: RootState) =>
  state.offers.couponResult;
export const selectOfferLoading = (state: RootState) => state.offers.loading;
export const selectOfferMutating = (state: RootState) => state.offers.mutating;
export const selectCouponValidating = (state: RootState) =>
  state.offers.validating;
export const selectOfferError = (state: RootState) => state.offers.error;
export const selectOfferSuccessMessage = (state: RootState) =>
  state.offers.successMessage;
