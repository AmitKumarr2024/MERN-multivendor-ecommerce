import type { RootState } from "@/store/store";

export const selectProductItems = (state: RootState) => state.products.items;
export const selectProductTotal = (state: RootState) => state.products.total;
export const selectProductPage = (state: RootState) => state.products.page;
export const selectProductPages = (state: RootState) => state.products.pages;
export const selectProductSort = (state: RootState) => state.products.sort;
export const selectProductListLoading = (state: RootState) => state.products.listLoading;

export const selectCurrentProduct = (state: RootState) => state.products.currentProduct;
export const selectProductDetailLoading = (state: RootState) => state.products.detailLoading;

export const selectShopProducts = (state: RootState) => state.products.shopProducts;
export const selectShopInfo = (state: RootState) => state.products.shopInfo;
export const selectShopProductsLoading = (state: RootState) => state.products.shopLoading;

export const selectMyProducts = (state: RootState) => state.products.myProducts;
export const selectMyProductsLoading = (state: RootState) => state.products.myProductsLoading;

export const selectProductMutating = (state: RootState) => state.products.mutating;
export const selectProductError = (state: RootState) => state.products.error;
export const selectProductSuccessMessage = (state: RootState) => state.products.successMessage;