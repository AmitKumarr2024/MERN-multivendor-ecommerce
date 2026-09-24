import type { RootState } from "@/store/store";

export const selectMyReservations = (s: RootState) =>
  s.reservation.myReservations;
export const selectMyReservationsLoading = (s: RootState) =>
  s.reservation.myLoading;
export const selectShopReservations = (s: RootState) =>
  s.reservation.shopReservations;
export const selectShopReservationsLoading = (s: RootState) =>
  s.reservation.shopLoading;
export const selectShopReservationStatus = (shopId: string) => (s: RootState) =>
  s.reservation.shopStatusByShop[shopId] ?? null;
export const selectReservationActionLoading = (s: RootState) =>
  s.reservation.actionLoading;
export const selectReservationError = (s: RootState) => s.reservation.error;
export const selectReservationSuccessMessage = (s: RootState) =>
  s.reservation.successMessage;
