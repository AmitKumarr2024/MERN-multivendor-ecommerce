import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import api from "@/services/axios";
import type { Product } from "@/features/products";
import type {
  SearchFallbackSuggestions,
  SearchResultsResponse,
} from "../types/search.types";

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

export const runSearch = createAsyncThunk<
  SearchResultsResponse,
  { q: string; page?: number; limit?: number },
  { rejectValue: string }
>("search/run", async ({ q, page, limit }, { rejectWithValue }) => {
  try {
    const { data } = await api.get<SearchResultsResponse>("/products/search", {
      params: { q, page, limit },
    });
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

interface SearchState {
  query: string;
  products: Product[];
  total: number;
  page: number;
  pages: number;
  fallbackSuggestions: SearchFallbackSuggestions | null;
  loading: boolean;
  error: string | null;
}

const initialState: SearchState = {
  query: "",
  products: [],
  total: 0,
  page: 1,
  pages: 1,
  fallbackSuggestions: null,
  loading: false,
  error: null,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    clearSearchResults(state) {
      state.products = [];
      state.total = 0;
      state.page = 1;
      state.pages = 1;
      state.fallbackSuggestions = null;
      state.query = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runSearch.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.query = action.meta.arg.q;
        if (!action.meta.arg.page || action.meta.arg.page === 1) {
          state.fallbackSuggestions = null;
        }
      })
      .addCase(runSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.products =
          action.payload.page === 1
            ? action.payload.products
            : [...state.products, ...action.payload.products];
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.fallbackSuggestions = action.payload.suggestions ?? null;
      })
      .addCase(runSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Search failed";
      });
  },
});

export const { clearSearchResults } = searchSlice.actions;
export default searchSlice.reducer;
