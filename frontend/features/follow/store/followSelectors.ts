import type { RootState } from "@/store/store";

export const selectFollowState = (shopId: string) => (state: RootState) =>
  state.follow.byShop[shopId] ?? null;
export const selectShopPublicStatsById =
  (shopId: string) => (state: RootState) =>
    state.follow.publicStats[shopId] ?? null;
export const selectFollowMutatingId = (state: RootState) =>
  state.follow.mutatingShopId;
export const selectFollowedShops = (state: RootState) => state.follow.followed;
export const selectShopCustomers = (state: RootState) => state.follow.customers;
export const selectFollowLoading = (state: RootState) => state.follow.loading;
export const selectFollowError = (state: RootState) => state.follow.error;
