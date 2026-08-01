import {
    createAsyncThunk,
    createSlice,
    PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";

import api from "@/services/axios";

import type {
    Category,
    CategoryState,
    CreateCategoryPayload,
    UpdateCategoryPayload,
} from "../types/category.types";

/* =========================================================
   ERROR HELPER
========================================================= */

function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        return (
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Something went wrong"
        );
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Something went wrong";
}

/* =========================================================
   FETCH ALL CATEGORIES
   GET /api/categories
========================================================= */

export const fetchCategories = createAsyncThunk<
    Category[],
    void,
    { rejectValue: string }
>(
    "category/fetchCategories",

    async (_, { rejectWithValue }) => {
        try {
            const response =
                await api.get<Category[]>(
                    "/categories",
                );

            return response.data;
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error),
            );
        }
    },
);

/* =========================================================
   CREATE CATEGORY
   POST /api/categories/create
========================================================= */

export const createCategory = createAsyncThunk<
    Category,
    CreateCategoryPayload,
    { rejectValue: string }
>(
    "category/createCategory",

    async (payload, { rejectWithValue }) => {
        try {
            const response =
                await api.post<Category>(
                    "/categories/create",
                    payload,
                );

            return response.data;
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error),
            );
        }
    },
);

/* =========================================================
   UPDATE CATEGORY
   PUT /api/categories/:id
========================================================= */

export const updateCategory = createAsyncThunk<
    Category,
    UpdateCategoryPayload,
    { rejectValue: string }
>(
    "category/updateCategory",

    async (
        { id, ...payload },
        { rejectWithValue },
    ) => {
        try {
            const response =
                await api.put<Category>(
                    `/categories/${id}`,
                    payload,
                );

            return response.data;
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error),
            );
        }
    },
);

/* =========================================================
   DELETE CATEGORY
   DELETE /api/categories/:id
========================================================= */

export const deleteCategory = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>(
    "category/deleteCategory",

    async (id, { rejectWithValue }) => {
        try {
            await api.delete(
                `/categories/${id}`,
            );

            return id;
        } catch (error) {
            return rejectWithValue(
                getErrorMessage(error),
            );
        }
    },
);

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState: CategoryState = {
    categories: [],

    selectedCategory: null,

    loading: false,

    error: null,

    successMessage: null,
};

/* =========================================================
   CATEGORY SLICE
========================================================= */

const categorySlice = createSlice({
    name: "category",

    initialState,

    reducers: {
        clearCategoryError(state) {
            state.error = null;
        },

        clearCategoryMessage(state) {
            state.successMessage = null;
        },

        setSelectedCategory(
            state,
            action: PayloadAction<Category | null>,
        ) {
            state.selectedCategory =
                action.payload;
        },

        resetCategoryState(state) {
            state.categories = [];

            state.selectedCategory = null;

            state.loading = false;

            state.error = null;

            state.successMessage = null;
        },
    },

    extraReducers: (builder) => {
        /* =================================================
           FETCH CATEGORIES
        ================================================= */

        builder
            .addCase(
                fetchCategories.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                },
            )

            .addCase(
                fetchCategories.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.categories =
                        action.payload;
                },
            )

            .addCase(
                fetchCategories.rejected,
                (state, action) => {
                    state.loading = false;

                    state.error =
                        action.payload ??
                        "Failed to fetch categories";
                },
            );

        /* =================================================
           CREATE CATEGORY
        ================================================= */

        builder
            .addCase(
                createCategory.pending,
                (state) => {
                    state.loading = true;

                    state.error = null;

                    state.successMessage =
                        null;
                },
            )

            .addCase(
                createCategory.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.categories.push(
                        action.payload,
                    );

                    state.successMessage =
                        "Category created successfully";
                },
            )

            .addCase(
                createCategory.rejected,
                (state, action) => {
                    state.loading = false;

                    state.error =
                        action.payload ??
                        "Failed to create category";
                },
            );

        /* =================================================
           UPDATE CATEGORY
        ================================================= */

        builder
            .addCase(
                updateCategory.pending,
                (state) => {
                    state.loading = true;

                    state.error = null;

                    state.successMessage =
                        null;
                },
            )

            .addCase(
                updateCategory.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.categories =
                        state.categories.map(
                            (category) =>
                                category._id ===
                                    action.payload._id
                                    ? action.payload
                                    : category,
                        );

                    if (
                        state
                            .selectedCategory
                            ?._id ===
                        action.payload._id
                    ) {
                        state.selectedCategory =
                            action.payload;
                    }

                    state.successMessage =
                        "Category updated successfully";
                },
            )

            .addCase(
                updateCategory.rejected,
                (state, action) => {
                    state.loading = false;

                    state.error =
                        action.payload ??
                        "Failed to update category";
                },
            );

        /* =================================================
           DELETE CATEGORY
        ================================================= */

        builder
            .addCase(
                deleteCategory.pending,
                (state) => {
                    state.loading = true;

                    state.error = null;

                    state.successMessage =
                        null;
                },
            )

            .addCase(
                deleteCategory.fulfilled,
                (state, action) => {
                    state.loading = false;

                    state.categories =
                        state.categories.filter(
                            (category) =>
                                category._id !==
                                action.payload,
                        );

                    if (
                        state
                            .selectedCategory
                            ?._id ===
                        action.payload
                    ) {
                        state.selectedCategory =
                            null;
                    }

                    state.successMessage =
                        "Category deleted successfully";
                },
            )

            .addCase(
                deleteCategory.rejected,
                (state, action) => {
                    state.loading = false;

                    state.error =
                        action.payload ??
                        "Failed to delete category";
                },
            );
    },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
    clearCategoryError,
    clearCategoryMessage,
    setSelectedCategory,
    resetCategoryState,
} = categorySlice.actions;

/* =========================================================
   REDUCER
========================================================= */

export default categorySlice.reducer;