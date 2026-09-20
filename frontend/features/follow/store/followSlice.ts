import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/services/axios";
import type {
  FollowStatus,
  ShopPublicStats,
  FollowedShopsResponse,
  ShopCustomersResponse,
  CustomerQuery,
} from "../types/follow.types";

interface FollowState {
  /** per-shop follow state + follower count, so many buttons can coexist */
  byShop: Record<string, FollowStatus>;
  publicStats: Record<string, ShopPublicStats>;
  followed: FollowedShopsResponse | null;
  customers: ShopCustomersResponse | null;
  mutatingShopId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: FollowState = {
  byShop: {},
  publicStats: {},
  followed: null,
  customers: null,
  mutatingShopId: null,
  loading: false,
  error: null,
};

// NOTE: generics kept on ONE line on purpose (paste-corruption lesson).
export const fetchShopPublicStats = createAsyncThunk<
  { shopId: string; stats: ShopPublicStats },
  string
>("follow/fetchPublicStats", async (shopId) => {
  const { data } = await axios.get(`/follows/shop/${shopId}/stats`);
  return { shopId, stats: data.data };
});

export const fetchFollowStatus = createAsyncThunk<
  { shopId: string; status: FollowStatus },
  string
>("follow/fetchStatus", async (shopId) => {
  const { data } = await axios.get(`/follows/shop/${shopId}/status`);
  return { shopId, status: data.data };
});

export const followShop = createAsyncThunk<
  { shopId: string; status: FollowStatus },
  string
>("follow/follow", async (shopId) => {
  const { data } = await axios.post(`/follows/shop/${shopId}`);
  return { shopId, status: data.data };
});

export const unfollowShop = createAsyncThunk<
  { shopId: string; status: FollowStatus },
  string
>("follow/unfollow", async (shopId) => {
  const { data } = await axios.delete(`/follows/shop/${shopId}`);
  return { shopId, status: data.data };
});

export const fetchMyFollowedShops = createAsyncThunk<
  FollowedShopsResponse,
  { page?: number } | void
>("follow/fetchMine", async (params) => {
  const { data } = await axios.get(`/follows/me`, {
    params: params ?? undefined,
  });
  return data.data;
});

export const fetchShopCustomers = createAsyncThunk<
  ShopCustomersResponse,
  CustomerQuery
>("follow/fetchCustomers", async ({ shopId, ...params }) => {
  const { data } = await axios.get(`/shops/${shopId}/customers`, {
    params: {
      ...params,
      segment: params.segment === "all" ? undefined : params.segment,
      search: params.search || undefined,
    },
  });
  return data.data;
});

const followSlice = createSlice({
  name: "follow",
  initialState,
  reducers: {
    clearFollowError(state) {
      state.error = null;
    },
    clearCustomers(state) {
      state.customers = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShopPublicStats.fulfilled, (state, a) => {
        state.publicStats[a.payload.shopId] = a.payload.stats;
      })
      .addCase(fetchFollowStatus.fulfilled, (state, a) => {
        state.byShop[a.payload.shopId] = a.payload.status;
      })
      .addCase(followShop.pending, (state, a) => {
        state.mutatingShopId = a.meta.arg;
        state.error = null;
      })
      .addCase(unfollowShop.pending, (state, a) => {
        state.mutatingShopId = a.meta.arg;
        state.error = null;
      })
      .addCase(followShop.fulfilled, (state, a) => {
        state.mutatingShopId = null;
        state.byShop[a.payload.shopId] = a.payload.status;
      })
      .addCase(unfollowShop.fulfilled, (state, a) => {
        state.mutatingShopId = null;
        state.byShop[a.payload.shopId] = a.payload.status;
        if (state.followed) {
          state.followed.items = state.followed.items.filter(
            (i) => i.shop._id !== a.payload.shopId,
          );
          state.followed.total = Math.max(0, state.followed.total - 1);
        }
      })
      .addCase(followShop.rejected, (state, a) => {
        state.mutatingShopId = null;
        state.error = a.error.message ?? "Could not follow shop";
      })
      .addCase(unfollowShop.rejected, (state, a) => {
        state.mutatingShopId = null;
        state.error = a.error.message ?? "Could not unfollow shop";
      })
      .addCase(fetchMyFollowedShops.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyFollowedShops.fulfilled, (state, a) => {
        state.loading = false;
        state.followed = a.payload;
      })
      .addCase(fetchMyFollowedShops.rejected, (state, a) => {
        state.loading = false;
        state.error = a.error.message ?? "Could not load followed shops";
      })
      .addCase(fetchShopCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShopCustomers.fulfilled, (state, a) => {
        state.loading = false;
        state.customers = a.payload;
      })
      .addCase(fetchShopCustomers.rejected, (state, a) => {
        state.loading = false;
        state.error = a.error.message ?? "Could not load customers";
      });
  },
});

export const { clearFollowError, clearCustomers } = followSlice.actions;
export default followSlice.reducer;
