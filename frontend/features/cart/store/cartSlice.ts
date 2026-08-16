import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import api from "@/services/axios";

import type { AddToCartPayload, Cart, UpdateCartItemArgs } from "../types/cart.types";

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

const BASE_URL = "/cart";

/* =========================================================
   1. GET MY CART
   GET /api/cart
========================================================= */

export const fetchMyCart = createAsyncThunk<Cart, void, { rejectValue: string }>(
    "cart/fetchMine",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get<Cart>(BASE_URL);
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    },
);

/* =========================================================
   2. ADD TO CART
   POST /api/cart/items
========================================================= */

export const addToCart = createAsyncThunk<Cart, AddToCartPayload, { rejectValue: string }>(
    "cart/addItem",
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await api.post<Cart>(`${BASE_URL}/items`, payload);
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    },
);

/* =========================================================
   3. UPDATE CART ITEM QUANTITY
   PUT /api/cart/items/:productId
========================================================= */

export const updateCartItem = createAsyncThunk<
    Cart,
    UpdateCartItemArgs,
    { rejectValue: string }
>("cart/updateItem", async ({ productId, quantity }, { rejectWithValue }) => {
    try {
        const { data } = await api.put<Cart>(`${BASE_URL}/items/${productId}`, { quantity });
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   4. REMOVE CART ITEM
   DELETE /api/cart/items/:productId
========================================================= */

export const removeCartItem = createAsyncThunk<Cart, string, { rejectValue: string }>(
    "cart/removeItem",
    async (productId, { rejectWithValue }) => {
        try {
            const { data } = await api.delete<Cart>(`${BASE_URL}/items/${productId}`);
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    },
);

/* =========================================================
   5. EMPTY CART
   DELETE /api/cart
========================================================= */

export const emptyCart = createAsyncThunk<Cart, void, { rejectValue: string }>(
    "cart/empty",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.delete<Cart>(BASE_URL);
            return data;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    },
);

/* =========================================================
   STATE
========================================================= */

interface CartState {
    cart: Cart | null;
    loading: boolean;
    /** Which productId is currently being added/updated/removed - drives per-row spinners. */
    mutatingProductId: string | null;
    error: string | null;
    successMessage: string | null;
}

const initialState: CartState = {
    cart: null,
    loading: false,
    mutatingProductId: null,
    error: null,
    successMessage: null,
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        clearCartError(state) {
            state.error = null;
        },
        clearCartMessage(state) {
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload;
            })
            .addCase(fetchMyCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to load cart";
            });

        builder
            .addCase(addToCart.pending, (state, action) => {
                state.mutatingProductId = action.meta.arg.productId;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.mutatingProductId = null;
                state.cart = action.payload;
                state.successMessage = "Added to cart";
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.mutatingProductId = null;
                state.error = action.payload || "Failed to add to cart";
            });

        builder
            .addCase(updateCartItem.pending, (state, action) => {
                state.mutatingProductId = action.meta.arg.productId;
                state.error = null;
            })
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.mutatingProductId = null;
                state.cart = action.payload;
            })
            .addCase(updateCartItem.rejected, (state, action) => {
                state.mutatingProductId = null;
                state.error = action.payload || "Failed to update quantity";
            });

        builder
            .addCase(removeCartItem.pending, (state, action) => {
                state.mutatingProductId = action.meta.arg;
                state.error = null;
            })
            .addCase(removeCartItem.fulfilled, (state, action) => {
                state.mutatingProductId = null;
                state.cart = action.payload;
            })
            .addCase(removeCartItem.rejected, (state, action) => {
                state.mutatingProductId = null;
                state.error = action.payload || "Failed to remove item";
            });

        builder
            .addCase(emptyCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(emptyCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cart = action.payload;
                state.successMessage = "Cart cleared";
            })
            .addCase(emptyCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to clear cart";
            });
    },
});

export const { clearCartError, clearCartMessage } = cartSlice.actions;

export default cartSlice.reducer;