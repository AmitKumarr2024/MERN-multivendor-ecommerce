import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import api from "@/services/axios";

import type { CheckServiceabilityPayload, ServiceabilityResult } from "../types/logistics.types";

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

/**
 * POST /api/logistics/check — public, used on the product/checkout page
 * to show "Delivery in ~4 days, ₹49" before an order exists.
 *
 * shipOrder (POST /api/orders/:id/ship) and getTracking
 * (GET /api/orders/:id/tracking) are NOT here — they're mounted under
 * /api/orders in the backend, so they already live in features/order's
 * slice (shipOrder, fetchOrderTracking thunks). Don't duplicate them here.
 */
export const checkServiceability = createAsyncThunk<
    ServiceabilityResult,
    CheckServiceabilityPayload,
    { rejectValue: string }
>("logistics/checkServiceability", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post<ServiceabilityResult>("/logistics/check", payload);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

interface LogisticsState {
    result: ServiceabilityResult | null;
    loading: boolean;
    error: string | null;
}

const initialState: LogisticsState = {
    result: null,
    loading: false,
    error: null,
};

const logisticsSlice = createSlice({
    name: "logistics",
    initialState,
    reducers: {
        clearServiceabilityResult(state) {
            state.result = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(checkServiceability.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkServiceability.fulfilled, (state, action) => {
                state.loading = false;
                state.result = action.payload;
            })
            .addCase(checkServiceability.rejected, (state, action) => {
                state.loading = false;
                state.result = null;
                state.error = action.payload || "Failed to check delivery availability";
            });
    },
});

export const { clearServiceabilityResult } = logisticsSlice.actions;

export default logisticsSlice.reducer;