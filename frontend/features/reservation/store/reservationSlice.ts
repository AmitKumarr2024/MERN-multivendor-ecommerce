import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import api from "@/services/axios";
import type {
  CreateReservationPayload,
  PaginatedReservations,
  Reservation,
  ShopReservationSettingsPayload,
  ShopReservationStatus,
} from "../types/reservation.types";

function msg(e: unknown): string {
  if (axios.isAxiosError(e)) return e.response?.data?.message || e.message || "Something went wrong";
  if (e instanceof Error) return e.message;
  return "Something went wrong";
}
type Rej = { rejectValue: string };

export const fetchShopReservationStatus = createAsyncThunk<
  { shopId: string; status: ShopReservationStatus }, string, Rej
>("reservation/fetchShopStatus", async (shopId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/shops/${shopId}/reservations/status`);
    return { shopId, status: data.data };
  } catch (e) { return rejectWithValue(msg(e)); }
});

export const createReservation = createAsyncThunk<Reservation, CreateReservationPayload, Rej>(
  "reservation/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/reservations", payload);
      return data.data;
    } catch (e) { return rejectWithValue(msg(e)); }
  },
);

export const fetchMyReservations = createAsyncThunk<
  PaginatedReservations, { status?: string } | void, Rej
>("reservation/fetchMine", async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/reservations/my", { params: params ?? undefined });
    return data.data;
  } catch (e) { return rejectWithValue(msg(e)); }
});

export const fetchShopReservations = createAsyncThunk<
  PaginatedReservations, { shopId: string; status?: string }, Rej
>("reservation/fetchShop", async ({ shopId, ...params }, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/shops/${shopId}/reservations`, { params });
    return data.data;
  } catch (e) { return rejectWithValue(msg(e)); }
});

export const confirmReservation = createAsyncThunk<Reservation, string, Rej>(
  "reservation/confirm",
  async (id, { rejectWithValue }) => {
    try { return (await api.patch(`/reservations/${id}/confirm`)).data.data; }
    catch (e) { return rejectWithValue(msg(e)); }
  },
);

export const rejectReservation = createAsyncThunk
  <Reservation, { id: string; rejectionReason: string }, Rej
>("reservation/reject", async ({ id, rejectionReason }, { rejectWithValue }) => {
  try { return (await api.patch(`/reservations/${id}/reject`, { rejectionReason })).data.data; }
  catch (e) { return rejectWithValue(msg(e)); }
});

export const markReservationReady = createAsyncThunk<Reservation, string, Rej>(
  "reservation/ready",
  async (id, { rejectWithValue }) => {
    try { return (await api.patch(`/reservations/${id}/ready`)).data.data; }
    catch (e) { return rejectWithValue(msg(e)); }
  },
);

export const markReservationCollected = createAsyncThunk<Reservation, string, Rej>(
  "reservation/collected",
  async (id, { rejectWithValue }) => {
    try { return (await api.patch(`/reservations/${id}/collected`)).data.data; }
    catch (e) { return rejectWithValue(msg(e)); }
  },
);

export const cancelReservation = createAsyncThunk
  <Reservation, { id: string; asSeller?: boolean; reason?: string }, Rej
>("reservation/cancel", async ({ id, asSeller, reason }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/reservations/${id}/cancel`, {
      as: asSeller ? "seller" : "buyer",
      reason,
    });
    return data.data;
  } catch (e) { return rejectWithValue(msg(e)); }
});

export const updateShopReservationSettings = createAsyncThunk<
  ShopReservationStatus, { shopId: string; payload: ShopReservationSettingsPayload }, Rej
>("reservation/updateSettings", async ({ shopId, payload }, { rejectWithValue }) => {
  try {
    await api.patch(`/shops/${shopId}/reservations/settings`, payload);
    const { data } = await api.get(`/shops/${shopId}/reservations/status`);
    return data.data;
  } catch (e) { return rejectWithValue(msg(e)); }
});

export const toggleProductReservation = createAsyncThunk<
  { _id: string; reservationEnabled: boolean }, { productId: string; enabled: boolean }, Rej
>("reservation/toggleProduct", async ({ productId, enabled }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/products/${productId}/toggle-reservation`, { enabled });
    return { _id: data._id ?? productId, reservationEnabled: enabled };
  } catch (e) { return rejectWithValue(msg(e)); }
});

interface State {
  myReservations: Reservation[];
  myTotal: number; myPage: number; myPages: number; myLoading: boolean;

  shopReservations: Reservation[];
  shopTotal: number; shopPage: number; shopPages: number; shopLoading: boolean;

  shopStatusByShop: Record<string, ShopReservationStatus>;
  actionLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: State = {
  myReservations: [], myTotal: 0, myPage: 1, myPages: 1, myLoading: false,
  shopReservations: [], shopTotal: 0, shopPage: 1, shopPages: 1, shopLoading: false,
  shopStatusByShop: {},
  actionLoading: false,
  error: null,
  successMessage: null,
};

function patchLocal(list: Reservation[], updated: Reservation) {
  return list.map((r) => (r._id === updated._id ? updated : r));
}

const reservationSlice = createSlice({
  name: "reservation",
  initialState,
  reducers: {
    clearReservationError(state) { state.error = null; },
    clearReservationMessage(state) { state.successMessage = null; },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchShopReservationStatus.fulfilled, (state, action) => {
      state.shopStatusByShop[action.payload.shopId] = action.payload.status;
    });

    builder
      .addCase(createReservation.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.myReservations.unshift(action.payload);
        state.successMessage = "Reservation requested — waiting for the seller to confirm.";
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || "Failed to reserve this product";
      });

    builder
      .addCase(fetchMyReservations.pending, (state) => { state.myLoading = true; })
      .addCase(fetchMyReservations.fulfilled, (state, action) => {
        state.myLoading = false;
        state.myReservations = action.payload.items;
        state.myTotal = action.payload.total;
        state.myPage = action.payload.page;
        state.myPages = action.payload.pages;
      })
      .addCase(fetchMyReservations.rejected, (state, action) => {
        state.myLoading = false;
        state.error = action.payload || "Failed to load your reservations";
      });

    builder
      .addCase(fetchShopReservations.pending, (state) => { state.shopLoading = true; })
      .addCase(fetchShopReservations.fulfilled, (state, action) => {
        state.shopLoading = false;
        state.shopReservations = action.payload.items;
        state.shopTotal = action.payload.total;
        state.shopPage = action.payload.page;
        state.shopPages = action.payload.pages;
      })
      .addCase(fetchShopReservations.rejected, (state, action) => {
        state.shopLoading = false;
        state.error = action.payload || "Failed to load reservations";
      });

    const applyUpdate = (state: State, updated: Reservation) => {
      state.actionLoading = false;
      state.myReservations = patchLocal(state.myReservations, updated);
      state.shopReservations = patchLocal(state.shopReservations, updated);
    };

    [confirmReservation, rejectReservation, markReservationReady, markReservationCollected, cancelReservation]
      .forEach((thunk) => {
        builder
          .addCase(thunk.pending, (state) => { state.actionLoading = true; state.error = null; })
          .addCase(thunk.fulfilled, (state, action) => applyUpdate(state, action.payload))
          .addCase(thunk.rejected, (state, action) => {
            state.actionLoading = false;
            state.error = action.payload || "Action failed";
          });
      });
  },
});

export const { clearReservationError, clearReservationMessage } = reservationSlice.actions;
export default reservationSlice.reducer;