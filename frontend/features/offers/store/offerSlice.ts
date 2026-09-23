import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import api from "@/services/axios";
import type {
  CouponValidationResult,
  CreateOfferPayload,
  Offer,
  UpdateOfferPayload,
} from "../types/offer.types";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error))
    return (
      error.response?.data?.message || error.message || "Something went wrong"
    );
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export const fetchShopOffers = createAsyncThunk<
  Offer[],
  string,
  { rejectValue: string }
>("offers/fetchShopOffers", async (shopId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/shops/${shopId}/offers`);
    return data.data;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const fetchPublicOffers = createAsyncThunk<
  { shopId: string; offers: Offer[] },
  string,
  { rejectValue: string }
>("offers/fetchPublicOffers", async (shopId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/shops/${shopId}/offers/public`);
    return { shopId, offers: data.data };
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const createOffer = createAsyncThunk<
  Offer,
  { shopId: string; payload: CreateOfferPayload },
  { rejectValue: string }
>("offers/create", async ({ shopId, payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/shops/${shopId}/offers`, payload);
    return data.data;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const updateOffer = createAsyncThunk<
  Offer,
  UpdateOfferPayload,
  { rejectValue: string }
>("offers/update", async ({ shopId, id, ...payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/shops/${shopId}/offers/${id}`, payload);
    return data.data;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const deleteOffer = createAsyncThunk<
  { shopId: string; id: string },
  { shopId: string; id: string },
  { rejectValue: string }
>("offers/delete", async ({ shopId, id }, { rejectWithValue }) => {
  try {
    await api.delete(`/shops/${shopId}/offers/${id}`);
    return { shopId, id };
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const validateCoupon = createAsyncThunk<
  CouponValidationResult,
  { shopId: string; code: string },
  { rejectValue: string }
>("offers/validateCoupon", async ({ shopId, code }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/shops/${shopId}/offers/validate-coupon`, {
      code,
    });
    return data.data;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

interface OfferState {
  shopOffers: Offer[];
  publicOffersByShop: Record<string, Offer[]>;
  couponResult: CouponValidationResult | null;
  loading: boolean;
  mutating: boolean;
  validating: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: OfferState = {
  shopOffers: [],
  publicOffersByShop: {},
  couponResult: null,
  loading: false,
  mutating: false,
  validating: false,
  error: null,
  successMessage: null,
};

const offerSlice = createSlice({
  name: "offers",
  initialState,
  reducers: {
    clearOfferError(state) {
      state.error = null;
    },
    clearOfferMessage(state) {
      state.successMessage = null;
    },
    clearCouponResult(state) {
      state.couponResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShopOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShopOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.shopOffers = action.payload;
      })
      .addCase(fetchShopOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load offers";
      });

    builder.addCase(fetchPublicOffers.fulfilled, (state, action) => {
      state.publicOffersByShop[action.payload.shopId] = action.payload.offers;
    });

    builder
      .addCase(createOffer.pending, (state) => {
        state.mutating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createOffer.fulfilled, (state, action) => {
        state.mutating = false;
        state.shopOffers.unshift(action.payload);
        state.successMessage = "Offer created";
      })
      .addCase(createOffer.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload || "Failed to create offer";
      });

    builder
      .addCase(updateOffer.pending, (state) => {
        state.mutating = true;
        state.error = null;
      })
      .addCase(updateOffer.fulfilled, (state, action) => {
        state.mutating = false;
        state.shopOffers = state.shopOffers.map((o) =>
          o._id === action.payload._id ? action.payload : o,
        );
        state.successMessage = "Offer updated";
      })
      .addCase(updateOffer.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload || "Failed to update offer";
      });

    builder
      .addCase(deleteOffer.fulfilled, (state, action) => {
        state.shopOffers = state.shopOffers.filter(
          (o) => o._id !== action.payload.id,
        );
        state.successMessage = "Offer deleted";
      })
      .addCase(deleteOffer.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete offer";
      });

    builder
      .addCase(validateCoupon.pending, (state) => {
        state.validating = true;
        state.error = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.validating = false;
        state.couponResult = action.payload;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.validating = false;
        state.couponResult = null;
        state.error = action.payload || "Failed to validate coupon";
      });
  },
});

export const { clearOfferError, clearOfferMessage, clearCouponResult } =
  offerSlice.actions;
export default offerSlice.reducer;
