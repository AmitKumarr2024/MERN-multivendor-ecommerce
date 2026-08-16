import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import api from "@/services/axios";

import type { AddToWishlistPayload, Wishlist } from "../types/wishlist.types";

function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        return (
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Something went wrong"
        );
    }
    if (error instanceof Error) return error.message;
    return "Something went wrong";
}

const BASE_URL = "/wishlist";

export const fetchMyWishlist = createAsyncThunk<Wishlist, void, { rejectValue: string }>(
    "wishlist/fetchMine",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get<Wishlist>(BASE_URL);
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    },
);

export const addToWishlist = createAsyncThunk<
    Wishlist,
    AddToWishlistPayload,
    { rejectValue: string }
>("wishlist/addItem", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post<Wishlist>(`${BASE_URL}/items`, payload);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const removeFromWishlist = createAsyncThunk<Wishlist, string, { rejectValue: string }>(
    "wishlist/removeItem",
    async (productId, { rejectWithValue }) => {
        try {
            const { data } = await api.delete<Wishlist>(`${BASE_URL}/items/${productId}`);
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    },
);

export const clearWishlist = createAsyncThunk<Wishlist, void, { rejectValue: string }>(
    "wishlist/clear",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.delete<Wishlist>(BASE_URL);
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    },
);

/* =========================================================
   STATE
========================================================= */

interface WishlistState {
    wishlist: Wishlist | null;
    /** Cheap client-side lookup set — avoids an API call per product card. */
    productIds: string[];
    hasLoaded: boolean;
    loading: boolean;
    mutatingProductId: string | null;
    error: string | null;
    successMessage: string | null;
}

const initialState: WishlistState = {
    wishlist: null,
    productIds: [],
    hasLoaded: false,
    loading: false,
    mutatingProductId: null,
    error: null,
    successMessage: null,
};

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState,
    reducers: {
        clearWishlistError(state) {
            state.error = null;
        },
        clearWishlistMessage(state) {
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.hasLoaded = true;
                state.wishlist = action.payload;
                state.productIds = action.payload.products.map((p: any) =>
    typeof p === "object" ? p._id : p.toString(),
);
            })
            .addCase(fetchMyWishlist.rejected, (state, action) => {
                state.loading = false;
                state.hasLoaded = true;
                state.error = action.payload || "Failed to load wishlist";
            });

        builder
            .addCase(addToWishlist.pending, (state, action) => {
                state.mutatingProductId = action.meta.arg.productId;
                state.error = null;
                // Optimistic - card heart fills instantly.
                if (!state.productIds.includes(action.meta.arg.productId)) {
                    state.productIds.push(action.meta.arg.productId);
                }
            })
            .addCase(addToWishlist.fulfilled, (state, action) => {
                state.mutatingProductId = null;
                state.wishlist = action.payload;
                state.productIds = action.payload.products.map((p: any) =>
    typeof p === "object" ? p._id : p.toString(),
);
                state.successMessage = "Added to wishlist";
            })
            .addCase(addToWishlist.rejected, (state, action) => {
                state.mutatingProductId = null;
                // Roll back the optimistic add.
                state.productIds = state.productIds.filter(
                    (id) => id !== action.meta.arg.productId,
                );
                state.error = action.payload || "Failed to add to wishlist";
            });

        builder
            .addCase(removeFromWishlist.pending, (state, action) => {
                state.mutatingProductId = action.meta.arg;
                state.error = null;
                state.productIds = state.productIds.filter((id) => id !== action.meta.arg);
            })
            .addCase(removeFromWishlist.fulfilled, (state, action) => {
                state.mutatingProductId = null;
                state.wishlist = action.payload;
                state.productIds = action.payload.products.map((p: any) =>
    typeof p === "object" ? p._id : p.toString(),
);
            })
            .addCase(removeFromWishlist.rejected, (state, action) => {
                state.mutatingProductId = null;
                // Roll back - the remove failed, product is still wishlisted.
                if (!state.productIds.includes(action.meta.arg)) {
                    state.productIds.push(action.meta.arg);
                }
                state.error = action.payload || "Failed to remove from wishlist";
            });

        builder
            .addCase(clearWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(clearWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.wishlist = action.payload;
                state.productIds = [];
                state.successMessage = "Wishlist cleared";
            })
            .addCase(clearWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to clear wishlist";
            });
    },
});

export const { clearWishlistError, clearWishlistMessage } = wishlistSlice.actions;

export default wishlistSlice.reducer;