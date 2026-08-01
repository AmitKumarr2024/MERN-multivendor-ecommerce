import type { RootState } from "@/store/store";

export const selectCategory = (
    state: RootState,
) => state.category;

export const selectCategories = (
    state: RootState,
) => state.category.categories;

export const selectSelectedCategory = (
    state: RootState,
) => state.category.selectedCategory;

export const selectCategoryLoading = (
    state: RootState,
) => state.category.loading;

export const selectCategoryError = (
    state: RootState,
) => state.category.error;

export const selectCategorySuccessMessage = (
    state: RootState,
) => state.category.successMessage;