import type { RootState } from "@/store/store";

export const selectServiceabilityResult = (state: RootState) => state.logistics.result;
export const selectServiceabilityLoading = (state: RootState) => state.logistics.loading;
export const selectServiceabilityError = (state: RootState) => state.logistics.error;