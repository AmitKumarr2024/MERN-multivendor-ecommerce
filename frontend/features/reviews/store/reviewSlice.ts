import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import api from "@/services/axios";

import type {
  CreateReviewPayload,
  GetProductReviewsResponse,
  Review,
  ReviewEligibilityResponse,
  ReviewSort,
  UpdateReviewPayload,
  ReplyToReviewPayload,
} from "../types/review.types";

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

export const fetchProductReviews = createAsyncThunk<
  GetProductReviewsResponse,
  { productId: string; page?: number; limit?: number; sort?: ReviewSort },
  { rejectValue: string }
>(
  "reviews/fetchForProduct",
  async ({ productId, ...params }, { rejectWithValue }) => {
    try {
      const { data } = await api.get<GetProductReviewsResponse>(
        `/products/${productId}/reviews`,
        { params },
      );
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchReviewEligibility = createAsyncThunk<
  ReviewEligibilityResponse,
  string,
  { rejectValue: string }
>("reviews/fetchEligibility", async (productId, { rejectWithValue }) => {
  try {
    const { data } = await api.get<ReviewEligibilityResponse>(
      `/products/${productId}/reviews/eligibility`,
    );
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createReview = createAsyncThunk<
  Review,
  CreateReviewPayload,
  { rejectValue: string }
>("reviews/create", async ({ productId, ...payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.post<Review>(
      `/products/${productId}/reviews`,
      payload,
    );
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateReview = createAsyncThunk<
  Review,
  UpdateReviewPayload,
  { rejectValue: string }
>("reviews/update", async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put<Review>(`/reviews/${id}`, payload);
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteReview = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("reviews/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/reviews/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const replyToReview = createAsyncThunk<
  Review,
  ReplyToReviewPayload,
  { rejectValue: string }
>("reviews/reply", async ({ id, text }, { rejectWithValue }) => {
  try {
    const { data } = await api.post<Review>(`/reviews/${id}/reply`, { text });
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const markReviewHelpful = createAsyncThunk<
  { _id: string; helpfulCount: number },
  string,
  { rejectValue: string }
>("reviews/markHelpful", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.patch<{ _id: string; helpfulCount: number }>(
      `/reviews/${id}/helpful`,
    );
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

interface ReviewState {
  items: Review[];
  total: number;
  page: number;
  pages: number;
  ratingBreakdown: { 5: number; 4: number; 3: number; 2: number; 1: number };
  listLoading: boolean;
  eligibility: ReviewEligibilityResponse | null;
  eligibilityLoading: boolean;
  mutating: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ReviewState = {
  items: [],
  total: 0,
  page: 1,
  pages: 1,
  ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  listLoading: false,
  eligibility: null,
  eligibilityLoading: false,
  mutating: false,
  error: null,
  successMessage: null,
};

const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearReviewError(state) {
      state.error = null;
    },
    clearReviewMessage(state) {
      state.successMessage = null;
    },
    clearReviews(state) {
      state.items = [];
      state.total = 0;
      state.page = 1;
      state.pages = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductReviews.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.listLoading = false;
        state.items =
          action.payload.page === 1
            ? action.payload.reviews
            : [...state.items, ...action.payload.reviews];
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.ratingBreakdown = action.payload.ratingBreakdown;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload || "Failed to load reviews";
      });

    builder
      .addCase(fetchReviewEligibility.pending, (state) => {
        state.eligibilityLoading = true;
      })
      .addCase(fetchReviewEligibility.fulfilled, (state, action) => {
        state.eligibilityLoading = false;
        state.eligibility = action.payload;
      })
      .addCase(fetchReviewEligibility.rejected, (state) => {
        state.eligibilityLoading = false;
      });

    builder
      .addCase(createReview.pending, (state) => {
        state.mutating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.mutating = false;
        state.items.unshift(action.payload);
        state.total += 1;
        state.successMessage = "Review submitted — thank you!";
        if (state.eligibility) {
          state.eligibility.eligibleOrders =
            state.eligibility.eligibleOrders.filter(
              (o) => o.orderId !== action.payload.order,
            );
          state.eligibility.canReview =
            state.eligibility.eligibleOrders.length > 0;
        }
      })
      .addCase(createReview.rejected, (state, action) => {
        state.mutating = false;
        state.error = action.payload || "Failed to submit review";
      });

    builder
      .addCase(updateReview.fulfilled, (state, action) => {
        const idx = state.items.findIndex((r) => r._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
        state.successMessage = "Review updated";
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.error = action.payload || "Failed to update review";
      });

    builder
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r._id !== action.payload);
        state.total = Math.max(0, state.total - 1);
        state.successMessage = "Review deleted";
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete review";
      });

    builder.addCase(replyToReview.fulfilled, (state, action) => {
      const idx = state.items.findIndex((r) => r._id === action.payload._id);
      if (idx !== -1) state.items[idx] = action.payload;
      state.successMessage = "Reply posted";
    });

    builder.addCase(markReviewHelpful.fulfilled, (state, action) => {
      const review = state.items.find((r) => r._id === action.payload._id);
      if (review) review.helpfulCount = action.payload.helpfulCount;
    });
  },
});

export const { clearReviewError, clearReviewMessage, clearReviews } =
  reviewSlice.actions;
export default reviewSlice.reducer;
