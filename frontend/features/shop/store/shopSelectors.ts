import type { RootState } from "@/store/store";

export const selectShops = (state: RootState) => state.shop.shops;
export const selectShopTotal = (state: RootState) => state.shop.total;
export const selectShopPage = (state: RootState) => state.shop.page;
export const selectShopPages = (state: RootState) => state.shop.pages;
export const selectDirectoryLoading = (state: RootState) => state.shop.directoryLoading;

export const selectViewedShop = (state: RootState) => state.shop.viewedShop;
export const selectViewedShopLoading = (state: RootState) => state.shop.viewedShopLoading;
export const selectIsOpenInfo = (state: RootState) => state.shop.isOpenInfo;

export const selectMyShop = (state: RootState) => state.shop.myShop;
export const selectMyShopLoading = (state: RootState) => state.shop.myShopLoading;
export const selectHasCheckedMyShop = (state: RootState) => state.shop.hasCheckedMyShop;

export const selectSlugCheck = (state: RootState) => state.shop.slugCheck;
export const selectSlugChecking = (state: RootState) => state.shop.slugChecking;

export const selectShopMutating = (state: RootState) => state.shop.mutating;
export const selectShopError = (state: RootState) => state.shop.error;
export const selectShopSuccessMessage = (state: RootState) => state.shop.successMessage;