import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/services/axios";
import type {
  Khata,
  KhataTransaction,
  MonthlyStatement,
  KhataSettlement,
  ShopKhataStatus,
} from "../types/khata.types";

interface KhataState {
  myKhatas: Khata[];
  shopKhatas: Khata[]; // seller: requests/accounts for the currently viewed shop
  shopKhataStatus: ShopKhataStatus | null; // buyer: does this shop offer khata + my request
  activeKhata: Khata | null; // whichever khata is open in a detail panel
  transactions: KhataTransaction[];
  statement: MonthlyStatement | null;
  lastSettlement: KhataSettlement | null;
  loading: boolean;
  actionLoading: boolean; // separate flag for approve/reject/payment actions so lists don't full-reload
  error: string | null;
}

const initialState: KhataState = {
  myKhatas: [],
  shopKhatas: [],
  shopKhataStatus: null,
  activeKhata: null,
  transactions: [],
  statement: null,
  lastSettlement: null,
  loading: false,
  actionLoading: false,
  error: null,
};

// ---------------- Buyer thunks ----------------

export const fetchShopKhataStatus = createAsyncThunk<ShopKhataStatus, string>(
  "khata/fetchShopStatus",
  async (shopId) => {
    const { data } = await axios.get(`/shops/${shopId}/khata/status`);
    return data.data;
  }
);

export const applyForKhata = createAsyncThunk<
  Khata,
  { shopId: string; requestNote?: string }
>("khata/apply", async ({ shopId, requestNote }) => {
  const { data } = await axios.post(`/shops/${shopId}/khata/apply`, { requestNote });
  return data.data;
});

export const fetchMyKhatas = createAsyncThunk<Khata[]>("khata/fetchMine", async () => {
  const { data } = await axios.get(`/khata/my`);
  return data.data;
});

// ---------------- Seller thunks ----------------

export const setShopKhataEnabled = createAsyncThunk<
  { khataEnabled: boolean },
  { shopId: string; enabled: boolean }
>("khata/setShopEnabled", async ({ shopId, enabled }) => {
  const { data } = await axios.patch(`/shops/${shopId}/khata/settings`, { enabled });
  return { khataEnabled: data.data.khataEnabled };
});

export const fetchShopKhataRequests = createAsyncThunk<
  Khata[],
  { shopId: string; status?: string }
>("khata/fetchShopRequests", async ({ shopId, status }) => {
  const { data } = await axios.get(`/shops/${shopId}/khata`, { params: { status } });
  return data.data;
});

export const approveKhata = createAsyncThunk<
  Khata,
  { id: string; creditLimit: number }
>("khata/approve", async ({ id, creditLimit }) => {
  const { data } = await axios.patch(`/khata/${id}/approve`, { creditLimit });
  return data.data;
});

export const rejectKhata = createAsyncThunk<
  Khata,
  { id: string; rejectionReason: string }
>("khata/reject", async ({ id, rejectionReason }) => {
  const { data } = await axios.patch(`/khata/${id}/reject`, { rejectionReason });
  return data.data;
});

export const suspendKhata = createAsyncThunk<
  Khata,
  { id: string; suspendedReason: string }
>("khata/suspend", async ({ id, suspendedReason }) => {
  const { data } = await axios.patch(`/khata/${id}/suspend`, { suspendedReason });
  return data.data;
});

export const reactivateKhata = createAsyncThunk<Khata, string>(
  "khata/reactivate",
  async (id) => {
    const { data } = await axios.patch(`/khata/${id}/reactivate`);
    return data.data;
  }
);

export const updateCreditLimit = createAsyncThunk<
  Khata,
  { id: string; creditLimit: number }
>("khata/updateCreditLimit", async ({ id, creditLimit }) => {
  const { data } = await axios.patch(`/khata/${id}/credit-limit`, { creditLimit });
  return data.data;
});

export const recordKhataPayment = createAsyncThunk<
  KhataTransaction,
  { id: string; amount: number; note?: string }
>("khata/recordPayment", async ({ id, amount, note }) => {
  const { data } = await axios.post(`/khata/${id}/payments`, { amount, note });
  return data.data;
});

export const closeKhataMonth = createAsyncThunk<
  KhataSettlement,
  { id: string; statementMonth: string }
>("khata/closeMonth", async ({ id, statementMonth }) => {
  const { data } = await axios.post(`/khata/${id}/close-month`, { statementMonth });
  return data.data;
});

// ---------------- Shared (buyer + seller) thunks ----------------

export const fetchTransactionHistory = createAsyncThunk<
  KhataTransaction[],
  { id: string; asSeller?: boolean }
>("khata/fetchTransactions", async ({ id, asSeller }) => {
  const { data } = await axios.get(`/khata/${id}/transactions`, {
    params: { as: asSeller ? "seller" : "buyer" },
  });
  return data.data;
});

export const fetchMonthlyStatement = createAsyncThunk<
  MonthlyStatement,
  { id: string; month: string; asSeller?: boolean }
>("khata/fetchStatement", async ({ id, month, asSeller }) => {
  const { data } = await axios.get(`/khata/${id}/statement`, {
    params: { month, as: asSeller ? "seller" : "buyer" },
  });
  return data.data;
});

export const checkKhataEligibility = createAsyncThunk<
  ShopKhataStatus,
  { shopId: string }
>("khata/checkEligibility", async ({ shopId }) => {
  const { data } = await axios.get(`/shops/${shopId}/khata/status`);
  return data.data;
});

const isPendingAction = (type: string) =>
  ["approve", "reject", "suspend", "reactivate", "updateCreditLimit", "recordPayment", "closeMonth", "apply", "setShopEnabled"].some(
    (t) => type.includes(t)
  );

const khataSlice = createSlice({
  name: "khata",
  initialState,
  reducers: {
    clearKhataError(state) {
      state.error = null;
    },
    setActiveKhata(state, action: PayloadAction<Khata | null>) {
      state.activeKhata = action.payload;
    },
    clearStatement(state) {
      state.statement = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Buyer
      .addCase(fetchShopKhataStatus.fulfilled, (state, action) => {
        state.shopKhataStatus = action.payload;
      })
      .addCase(applyForKhata.fulfilled, (state, action) => {
        state.shopKhataStatus = { khataEnabled: true, khata: action.payload };
      })
      .addCase(fetchMyKhatas.fulfilled, (state, action) => {
        state.myKhatas = action.payload;
      })
      // Seller
      .addCase(setShopKhataEnabled.fulfilled, (state, action) => {
        if (state.shopKhataStatus) state.shopKhataStatus.khataEnabled = action.payload.khataEnabled;
      })
      .addCase(fetchShopKhataRequests.fulfilled, (state, action) => {
        state.shopKhatas = action.payload;
      })
      .addCase(approveKhata.fulfilled, (state, action) => {
        state.shopKhatas = state.shopKhatas.map((k) => (k._id === action.payload._id ? action.payload : k));
        if (state.activeKhata?._id === action.payload._id) state.activeKhata = action.payload;
      })
      .addCase(rejectKhata.fulfilled, (state, action) => {
        state.shopKhatas = state.shopKhatas.map((k) => (k._id === action.payload._id ? action.payload : k));
        if (state.activeKhata?._id === action.payload._id) state.activeKhata = action.payload;
      })
      .addCase(suspendKhata.fulfilled, (state, action) => {
        state.shopKhatas = state.shopKhatas.map((k) => (k._id === action.payload._id ? action.payload : k));
        if (state.activeKhata?._id === action.payload._id) state.activeKhata = action.payload;
      })
      .addCase(reactivateKhata.fulfilled, (state, action) => {
        state.shopKhatas = state.shopKhatas.map((k) => (k._id === action.payload._id ? action.payload : k));
        if (state.activeKhata?._id === action.payload._id) state.activeKhata = action.payload;
      })
      .addCase(updateCreditLimit.fulfilled, (state, action) => {
        state.shopKhatas = state.shopKhatas.map((k) => (k._id === action.payload._id ? action.payload : k));
        if (state.activeKhata?._id === action.payload._id) state.activeKhata = action.payload;
      })
      .addCase(recordKhataPayment.fulfilled, (state, action) => {
        state.transactions = [action.payload, ...state.transactions];
        const khataId = action.payload.khata;
        state.shopKhatas = state.shopKhatas.map((k) =>
          k._id === khataId ? { ...k, outstandingBalance: action.payload.balanceAfter } : k
        );
        if (state.activeKhata?._id === khataId) {
          state.activeKhata = { ...state.activeKhata, outstandingBalance: action.payload.balanceAfter };
        }
      })
      .addCase(closeKhataMonth.fulfilled, (state, action) => {
        state.lastSettlement = action.payload;
      })
      // Shared
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })
      .addCase(fetchMonthlyStatement.fulfilled, (state, action) => {
        state.statement = action.payload;
      })
      // Generic loading/error matchers
      .addMatcher(
        (a) => a.type.startsWith("khata/") && a.type.endsWith("/pending"),
        (state, action: any) => {
          state.error = null;
          if (isPendingAction(action.type)) {
            state.actionLoading = true;
          } else {
            state.loading = true;
          }
        }
      )
      .addMatcher(
        (a) => a.type.startsWith("khata/") && a.type.endsWith("/fulfilled"),
        (state) => {
          state.loading = false;
          state.actionLoading = false;
        }
      )
      .addMatcher(
        (a) => a.type.startsWith("khata/") && a.type.endsWith("/rejected"),
        (state, action: any) => {
          state.loading = false;
          state.actionLoading = false;
          state.error = action.error?.message ?? "Something went wrong";
        }
      );
  },
});

export const { clearKhataError, setActiveKhata, clearStatement } = khataSlice.actions;
export default khataSlice.reducer;