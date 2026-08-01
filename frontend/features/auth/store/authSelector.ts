import type { RootState } from "@/store/store";

export const selectAuth = (state: RootState) => state.auth;

export const selectCurrentUser = (state: RootState) =>
    state.auth.user;

export const selectAuthLoading = (state: RootState) =>
    state.auth.loading;

export const selectAuthError = (state: RootState) =>
    state.auth.error;

export const selectAuthInitialized = (state: RootState) =>
    state.auth.initialized;

export const selectAuthSuccessMessage = (state: RootState) =>
    state.auth.successMessage;

export const selectIsAuthenticated = (state: RootState) =>
    Boolean(state.auth.user);

export const selectUserRole = (state: RootState) =>
    state.auth.user?.role ?? null;

export const selectIsBuyer = (state: RootState) =>
    state.auth.user?.role === "buyer";

export const selectIsSeller = (state: RootState) =>
    state.auth.user?.role === "seller";

export const selectIsAdmin = (state: RootState) =>
    state.auth.user?.role === "admin";