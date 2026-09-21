import type { RootState } from "@/store/store";

export const selectLoyaltyProgram = (s: RootState) => s.loyalty.program;
export const selectPublicProgram = (shopId: string) => (s: RootState) =>
  s.loyalty.publicPrograms[shopId] ?? null;
export const selectLoyaltyCustomers = (s: RootState) => s.loyalty.customers;
export const selectTopCustomers = (s: RootState) => s.loyalty.top;
export const selectCustomerTx = (s: RootState) => s.loyalty.customerTx;
export const selectShopRedemptions = (s: RootState) =>
  s.loyalty.shopRedemptions;
export const selectMyLoyaltyAccounts = (s: RootState) => s.loyalty.myAccounts;
export const selectShopLoyalty = (s: RootState) => s.loyalty.shopLoyalty;
export const selectMyLoyaltyTx = (s: RootState) => s.loyalty.myTx;
export const selectMyRedemptions = (s: RootState) => s.loyalty.myRedemptions;
export const selectLastVoucher = (s: RootState) => s.loyalty.lastVoucher;
export const selectLoyaltyLoading = (s: RootState) => s.loyalty.loading;
export const selectLoyaltyActionLoading = (s: RootState) =>
  s.loyalty.actionLoading;
export const selectLoyaltyError = (s: RootState) => s.loyalty.error;
