import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "@/services/axios";
import type {
  LoyaltyProgram,
  LoyaltyAccount,
  LoyaltyRedemption,
  LoyaltyTransaction,
  Paged,
  CustomersResponse,
  CustomerTxResponse,
  ShopLoyalty,
} from "../types/loyalty.types";

const msg = (e: unknown): string =>
  axios.isAxiosError(e)
    ? e.response?.data?.message || e.message
    : e instanceof Error
      ? e.message
      : "Something went wrong";
type Rej = { rejectValue: string };

interface State {
  program: LoyaltyProgram | null;
  publicPrograms: Record<string, LoyaltyProgram | null>;
  customers: CustomersResponse | null;
  top: LoyaltyAccount[];
  customerTx: CustomerTxResponse | null;
  shopRedemptions: Paged<LoyaltyRedemption> | null;
  myAccounts: LoyaltyAccount[];
  shopLoyalty: ShopLoyalty | null;
  myTx: Paged<LoyaltyTransaction> | null;
  myRedemptions: Paged<LoyaltyRedemption> | null;
  lastVoucher: LoyaltyRedemption | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: State = {
  program: null,
  publicPrograms: {},
  customers: null,
  top: [],
  customerTx: null,
  shopRedemptions: null,
  myAccounts: [],
  shopLoyalty: null,
  myTx: null,
  myRedemptions: null,
  lastVoucher: null,
  loading: false,
  actionLoading: false,
  error: null,
};

const base = (shopId: string) => `/shops/${shopId}/loyalty`;

// Seller
export const fetchProgram = createAsyncThunk<LoyaltyProgram, string, Rej>(
  "loyalty/fetchProgram",
  async (shopId, { rejectWithValue }) => {
    try {
      return (await api.get(`${base(shopId)}/program`)).data.data;
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  },
);
export const saveProgram = createAsyncThunk<
  LoyaltyProgram,
  { shopId: string; program: LoyaltyProgram },
  Rej
>("loyalty/saveProgram", async ({ shopId, program }, { rejectWithValue }) => {
  try {
    return (await api.put(`${base(shopId)}/program`, program)).data.data;
  } catch (e) {
    return rejectWithValue(msg(e));
  }
});
export const fetchCustomers = createAsyncThunk<
  CustomersResponse,
  { shopId: string; search?: string; sort?: string; page?: number },
  Rej
>(
  "loyalty/fetchCustomers",
  async ({ shopId, ...params }, { rejectWithValue }) => {
    try {
      return (
        await api.get(`${base(shopId)}/customers`, {
          params: { ...params, search: params.search || undefined },
        })
      ).data.data;
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  },
);
export const fetchTopCustomers = createAsyncThunk<
  LoyaltyAccount[],
  string,
  Rej
>("loyalty/fetchTop", async (shopId, { rejectWithValue }) => {
  try {
    return (await api.get(`${base(shopId)}/customers/top`)).data.data;
  } catch (e) {
    return rejectWithValue(msg(e));
  }
});
export const fetchCustomerTx = createAsyncThunk<
  CustomerTxResponse,
  { shopId: string; buyerId: string; page?: number },
  Rej
>(
  "loyalty/fetchCustomerTx",
  async ({ shopId, buyerId, page }, { rejectWithValue }) => {
    try {
      return (
        await api.get(`${base(shopId)}/customers/${buyerId}/transactions`, {
          params: { page },
        })
      ).data.data;
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  },
);
export const adjustPoints = createAsyncThunk<
  LoyaltyTransaction,
  { shopId: string; buyerId: string; points: number; reason: string },
  Rej
>(
  "loyalty/adjust",
  async ({ shopId, buyerId, points, reason }, { rejectWithValue }) => {
    try {
      return (
        await api.post(`${base(shopId)}/customers/${buyerId}/adjust`, {
          points,
          reason,
        })
      ).data.data;
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  },
);
export const fetchShopRedemptions = createAsyncThunk<
  Paged<LoyaltyRedemption>,
  string,
  Rej
>("loyalty/fetchShopRedemptions", async (shopId, { rejectWithValue }) => {
  try {
    return (await api.get(`${base(shopId)}/redemptions`)).data.data;
  } catch (e) {
    return rejectWithValue(msg(e));
  }
});
export const fulfillRedemption = createAsyncThunk<
  LoyaltyRedemption,
  { shopId: string; id: string },
  Rej
>("loyalty/fulfill", async ({ shopId, id }, { rejectWithValue }) => {
  try {
    return (await api.patch(`${base(shopId)}/redemptions/${id}/fulfill`)).data
      .data;
  } catch (e) {
    return rejectWithValue(msg(e));
  }
});

// Public + buyer
export const fetchPublicProgram = createAsyncThunk<
  { shopId: string; program: LoyaltyProgram | null },
  string,
  Rej
>("loyalty/fetchPublic", async (shopId, { rejectWithValue }) => {
  try {
    return {
      shopId,
      program: (await api.get(`${base(shopId)}/program/public`)).data.data,
    };
  } catch (e) {
    return rejectWithValue(msg(e));
  }
});
export const fetchMyAccounts = createAsyncThunk<LoyaltyAccount[], void, Rej>(
  "loyalty/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      return (await api.get(`/loyalty/my`)).data.data;
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  },
);
export const fetchShopLoyalty = createAsyncThunk<ShopLoyalty, string, Rej>(
  "loyalty/fetchShop",
  async (shopId, { rejectWithValue }) => {
    try {
      return (await api.get(`/loyalty/shop/${shopId}`)).data.data;
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  },
);
export const fetchMyTx = createAsyncThunk<
  Paged<LoyaltyTransaction>,
  { shopId: string; page?: number; type?: string },
  Rej
>("loyalty/fetchMyTx", async ({ shopId, ...params }, { rejectWithValue }) => {
  try {
    return (await api.get(`/loyalty/shop/${shopId}/transactions`, { params }))
      .data.data;
  } catch (e) {
    return rejectWithValue(msg(e));
  }
});
export const redeemReward = createAsyncThunk<
  { redemption: LoyaltyRedemption; account: LoyaltyAccount },
  { shopId: string; quantity?: number },
  Rej
>("loyalty/redeem", async ({ shopId, quantity }, { rejectWithValue }) => {
  try {
    return (await api.post(`/loyalty/shop/${shopId}/redeem`, { quantity })).data
      .data;
  } catch (e) {
    return rejectWithValue(msg(e));
  }
});
export const fetchMyRedemptions = createAsyncThunk<
  Paged<LoyaltyRedemption>,
  void,
  Rej
>("loyalty/fetchMyRedemptions", async (_, { rejectWithValue }) => {
  try {
    return (await api.get(`/loyalty/my/redemptions`)).data.data;
  } catch (e) {
    return rejectWithValue(msg(e));
  }
});

const ACTIONS = ["saveProgram", "adjust", "fulfill", "redeem"];

const loyaltySlice = createSlice({
  name: "loyalty",
  initialState,
  reducers: {
    clearLoyaltyError(state) {
      state.error = null;
    },
    clearVoucher(state) {
      state.lastVoucher = null;
    },
    clearCustomerTx(state) {
      state.customerTx = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchProgram.fulfilled, (s, a) => {
      s.program = a.payload;
    })
      .addCase(saveProgram.fulfilled, (s, a) => {
        s.program = a.payload;
      })
      .addCase(fetchCustomers.fulfilled, (s, a) => {
        s.customers = a.payload;
      })
      .addCase(fetchTopCustomers.fulfilled, (s, a) => {
        s.top = a.payload;
      })
      .addCase(fetchCustomerTx.fulfilled, (s, a) => {
        s.customerTx = a.payload;
      })
      .addCase(fetchShopRedemptions.fulfilled, (s, a) => {
        s.shopRedemptions = a.payload;
      })
      .addCase(fulfillRedemption.fulfilled, (s, a) => {
        if (s.shopRedemptions)
          s.shopRedemptions.items = s.shopRedemptions.items.map((r) =>
            r._id === a.payload._id ? { ...r, ...a.payload } : r,
          );
      })
      .addCase(fetchPublicProgram.fulfilled, (s, a) => {
        s.publicPrograms[a.payload.shopId] = a.payload.program;
      })
      .addCase(fetchMyAccounts.fulfilled, (s, a) => {
        s.myAccounts = a.payload;
      })
      .addCase(fetchShopLoyalty.fulfilled, (s, a) => {
        s.shopLoyalty = a.payload;
      })
      .addCase(fetchMyTx.fulfilled, (s, a) => {
        s.myTx = a.payload;
      })
      .addCase(fetchMyRedemptions.fulfilled, (s, a) => {
        s.myRedemptions = a.payload;
      })
      .addCase(redeemReward.fulfilled, (s, a) => {
        s.lastVoucher = a.payload.redemption;
        if (s.shopLoyalty) {
          s.shopLoyalty.account = a.payload.account;
          const min = s.shopLoyalty.program.minRedeemPoints;
          s.shopLoyalty.rewards = s.shopLoyalty.rewards.map((r) => ({
            ...r,
            redeemableNow: Math.max(
              0,
              Math.floor(a.payload.account.balance / min),
            ),
          }));
        }
      })
      .addMatcher(
        (a) => a.type.startsWith("loyalty/") && a.type.endsWith("/pending"),
        (s, a: { type: string }) => {
          s.error = null;
          if (ACTIONS.some((t) => a.type.includes(t))) s.actionLoading = true;
          else s.loading = true;
        },
      )
      .addMatcher(
        (a) => a.type.startsWith("loyalty/") && a.type.endsWith("/fulfilled"),
        (s) => {
          s.loading = false;
          s.actionLoading = false;
        },
      )
      .addMatcher(
        (a) => a.type.startsWith("loyalty/") && a.type.endsWith("/rejected"),
        (s, a: { payload?: unknown; error?: { message?: string } }) => {
          s.loading = false;
          s.actionLoading = false;
          s.error =
            (a.payload as string) || a.error?.message || "Something went wrong";
        },
      );
  },
});

export const { clearLoyaltyError, clearVoucher, clearCustomerTx } =
  loyaltySlice.actions;
export default loyaltySlice.reducer;
