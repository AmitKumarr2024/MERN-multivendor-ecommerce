import type { RootState } from "@/store/store";

export const selectSearchQuery = (state: RootState) => state.search.query;
export const selectSearchProducts = (state: RootState) => state.search.products;
export const selectSearchTotal = (state: RootState) => state.search.total;
export const selectSearchPage = (state: RootState) => state.search.page;
export const selectSearchPages = (state: RootState) => state.search.pages;
export const selectSearchFallback = (state: RootState) =>
  state.search.fallbackSuggestions;
export const selectSearchLoading = (state: RootState) => state.search.loading;
export const selectSearchError = (state: RootState) => state.search.error;
