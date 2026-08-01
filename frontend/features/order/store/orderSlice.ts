import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import api from "@/services/axios";

import type {
    CancelOrderArgs,
    CheckoutPayload,
    CheckoutResponse,
    Order,
    OrderQueryParams,
    PaginatedOrdersResponse,
    UpdateOrderStatusArgs,
} from "../types/order.types";

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

const BASE_URL = "/orders";

/* =========================================================
   BUYER
========================================================= */

export const checkout = createAsyncThunk<
    CheckoutResponse,
    CheckoutPayload,
    { rejectValue: string }
>("order/checkout", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post<CheckoutResponse>(`${BASE_URL}/checkout`, payload);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const fetchMyOrders = createAsyncThunk<
    PaginatedOrdersResponse,
    OrderQueryParams | void,
    { rejectValue: string }
>("order/fetchMine", async (params, { rejectWithValue }) => {
    try {
        const { data } = await api.get<PaginatedOrdersResponse>(`${BASE_URL}/me`, {
            params: params ?? undefined,
        });
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const cancelMyOrder = createAsyncThunk<
    { id: string; orderStatus: Order["orderStatus"] },
    CancelOrderArgs,
    { rejectValue: string }
>("order/cancel", async ({ id, reason }, { rejectWithValue }) => {
    try {
        const { data } = await api.patch<{ _id: string; orderStatus: Order["orderStatus"] }>(
            `${BASE_URL}/${id}/cancel`,
            { reason },
        );
        return { id: data._id, orderStatus: data.orderStatus };
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   SHARED
========================================================= */

export const fetchOrderById = createAsyncThunk<
    Order,
    string,
    { rejectValue: string }
>("order/fetchById", async (id, { rejectWithValue }) => {
    try {
        const { data } = await api.get<Order>(`${BASE_URL}/${id}`);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const fetchOrderTracking = createAsyncThunk<
    Order["shipment"],
    string,
    { rejectValue: string }
>("order/fetchTracking", async (id, { rejectWithValue }) => {
    try {
        const { data } = await api.get<Order["shipment"]>(`${BASE_URL}/${id}/tracking`);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   SELLER
========================================================= */

export const fetchShopOrders = createAsyncThunk<
    PaginatedOrdersResponse,
    OrderQueryParams | void,
    { rejectValue: string }
>("order/fetchShopOrders", async (params, { rejectWithValue }) => {
    try {
        const { data } = await api.get<PaginatedOrdersResponse>(`${BASE_URL}/shop`, {
            params: params ?? undefined,
        });
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const updateOrderStatus = createAsyncThunk<
    { id: string; orderStatus: Order["orderStatus"] },
    UpdateOrderStatusArgs,
    { rejectValue: string }
>("order/updateStatus", async ({ id, status }, { rejectWithValue }) => {
    try {
        const { data } = await api.patch<{ _id: string; orderStatus: Order["orderStatus"] }>(
            `${BASE_URL}/${id}/status`,
            { status },
        );
        return { id: data._id, orderStatus: data.orderStatus };
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

// Courier is auto-selected server-side — no picker needed on the frontend.
export const shipOrder = createAsyncThunk<
    Order,
    string,
    { rejectValue: string }
>("order/ship", async (id, { rejectWithValue }) => {
    try {
        const { data } = await api.post<Order>(`${BASE_URL}/${id}/ship`);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   STATE
========================================================= */

interface OrderState {
    myOrders: Order[];
    myOrdersTotal: number;
    myOrdersPage: number;
    myOrdersPages: number;
    myOrdersLoading: boolean;

    shopOrders: Order[];
    shopOrdersTotal: number;
    shopOrdersPage: number;
    shopOrdersPages: number;
    shopOrdersLoading: boolean;

    currentOrder: Order | null;
    orderLoading: boolean;

    mutatingOrderId: string | null;
    error: string | null;
    successMessage: string | null;
}

const initialState: OrderState = {
    myOrders: [],
    myOrdersTotal: 0,
    myOrdersPage: 1,
    myOrdersPages: 1,
    myOrdersLoading: false,

    shopOrders: [],
    shopOrdersTotal: 0,
    shopOrdersPage: 1,
    shopOrdersPages: 1,
    shopOrdersLoading: false,

    currentOrder: null,
    orderLoading: false,

    mutatingOrderId: null,
    error: null,
    successMessage: null,
};

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        clearOrderError(state) {
            state.error = null;
        },
        clearOrderMessage(state) {
            state.successMessage = null;
        },
        clearCurrentOrder(state) {
            state.currentOrder = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(checkout.pending, (state) => {
                state.orderLoading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(checkout.fulfilled, (state, action) => {
                state.orderLoading = false;
                state.successMessage = action.payload.message;
            })
            .addCase(checkout.rejected, (state, action) => {
                state.orderLoading = false;
                state.error = action.payload || "Checkout failed";
            });

        builder
            .addCase(fetchMyOrders.pending, (state) => {
                state.myOrdersLoading = true;
                state.error = null;
            })
            .addCase(fetchMyOrders.fulfilled, (state, action) => {
                state.myOrdersLoading = false;
                state.myOrders = action.payload.orders;
                state.myOrdersTotal = action.payload.total;
                state.myOrdersPage = action.payload.page;
                state.myOrdersPages = action.payload.pages;
            })
            .addCase(fetchMyOrders.rejected, (state, action) => {
                state.myOrdersLoading = false;
                state.error = action.payload || "Failed to load your orders";
            });

        builder
            .addCase(cancelMyOrder.pending, (state, action) => {
                state.mutatingOrderId = action.meta.arg.id;
            })
            .addCase(cancelMyOrder.fulfilled, (state, action) => {
                state.mutatingOrderId = null;
                const order = state.myOrders.find((o) => o._id === action.payload.id);
                if (order) order.orderStatus = action.payload.orderStatus;
                state.successMessage = "Order cancelled";
            })
            .addCase(cancelMyOrder.rejected, (state, action) => {
                state.mutatingOrderId = null;
                state.error = action.payload || "Failed to cancel order";
            });

        builder
            .addCase(fetchOrderById.pending, (state) => {
                state.orderLoading = true;
                state.error = null;
                state.currentOrder = null;
            })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.orderLoading = false;
                state.currentOrder = action.payload;
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.orderLoading = false;
                state.error = action.payload || "Order not found";
            });

        builder
            .addCase(fetchShopOrders.pending, (state) => {
                state.shopOrdersLoading = true;
                state.error = null;
            })
            .addCase(fetchShopOrders.fulfilled, (state, action) => {
                state.shopOrdersLoading = false;
                state.shopOrders = action.payload.orders;
                state.shopOrdersTotal = action.payload.total;
                state.shopOrdersPage = action.payload.page;
                state.shopOrdersPages = action.payload.pages;
            })
            .addCase(fetchShopOrders.rejected, (state, action) => {
                state.shopOrdersLoading = false;
                state.error = action.payload || "Failed to load orders";
            });

        builder
            .addCase(updateOrderStatus.pending, (state, action) => {
                state.mutatingOrderId = action.meta.arg.id;
                state.error = null;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.mutatingOrderId = null;
                const order = state.shopOrders.find((o) => o._id === action.payload.id);
                if (order) order.orderStatus = action.payload.orderStatus;
                state.successMessage = "Order status updated";
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.mutatingOrderId = null;
                state.error = action.payload || "Failed to update order status";
            });

        builder
            .addCase(shipOrder.pending, (state, action) => {
                state.mutatingOrderId = action.meta.arg;
                state.error = null;
            })
            .addCase(shipOrder.fulfilled, (state, action) => {
                state.mutatingOrderId = null;
                const idx = state.shopOrders.findIndex((o) => o._id === action.payload._id);
                if (idx !== -1) state.shopOrders[idx] = action.payload;
                state.successMessage = "Order shipped — courier assigned automatically";
            })
            .addCase(shipOrder.rejected, (state, action) => {
                state.mutatingOrderId = null;
                state.error = action.payload || "Failed to ship order";
            });
    },
});

export const { clearOrderError, clearOrderMessage, clearCurrentOrder } = orderSlice.actions;

export default orderSlice.reducer;