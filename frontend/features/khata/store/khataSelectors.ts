import type { RootState } from "@/store/store";
import type { Khata } from "../types/khata.types";

export const selectMyKhatas = (state: RootState) => state.khata.myKhatas;
export const selectShopKhatas = (state: RootState) => state.khata.shopKhatas;
export const selectShopKhataStatus = (state: RootState) =>
  state.khata.shopKhataStatus;
export const selectActiveKhata = (state: RootState) => state.khata.activeKhata;
export const selectKhataTransactions = (state: RootState) =>
  state.khata.transactions;
export const selectKhataStatement = (state: RootState) => state.khata.statement;
export const selectLastSettlement = (state: RootState) =>
  state.khata.lastSettlement;
export const selectKhataLoading = (state: RootState) => state.khata.loading;
export const selectKhataActionLoading = (state: RootState) =>
  state.khata.actionLoading;
export const selectKhataError = (state: RootState) => state.khata.error;

export const selectMyKhataForShop = (shopId: string) => (state: RootState) =>
  state.khata.myKhatas.find((k) => {
    const sId = typeof k.shop === "string" ? k.shop : k.shop._id;
    return sId === shopId;
  }) ?? null;

export const selectShopKhataByStatus =
  (status: Khata["status"]) => (state: RootState) =>
    state.khata.shopKhatas.filter((k) => k.status === status);

export const selectAvailableCredit = (khata: Khata | null) =>
  khata ? Math.max(0, khata.creditLimit - khata.outstandingBalance) : 0;

export const selectPendingRequestCount = (state: RootState) =>
  state.khata.shopKhatas.filter((k) => k.status === "pending").length;
