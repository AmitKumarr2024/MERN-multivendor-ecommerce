import type { RootState } from "@/store/store";

export const selectDashboardStats = (state: RootState) => state.admin.stats;
export const selectStatsLoading = (state: RootState) => state.admin.statsLoading;

export const selectAdminUsers = (state: RootState) => state.admin.users;
export const selectUsersTotal = (state: RootState) => state.admin.usersTotal;
export const selectUsersPage = (state: RootState) => state.admin.usersPage;
export const selectUsersPages = (state: RootState) => state.admin.usersPages;
export const selectUsersLoading = (state: RootState) => state.admin.usersLoading;

export const selectAdminShops = (state: RootState) => state.admin.shops;
export const selectShopsTotal = (state: RootState) => state.admin.shopsTotal;
export const selectShopsPage = (state: RootState) => state.admin.shopsPage;
export const selectShopsPages = (state: RootState) => state.admin.shopsPages;
export const selectShopsLoading = (state: RootState) => state.admin.shopsLoading;

export const selectAdminProducts = (state: RootState) => state.admin.products;
export const selectProductsTotal = (state: RootState) => state.admin.productsTotal;
export const selectProductsPage = (state: RootState) => state.admin.productsPage;
export const selectProductsPages = (state: RootState) => state.admin.productsPages;
export const selectProductsLoading = (state: RootState) => state.admin.productsLoading;

export const selectAdminOrders = (state: RootState) => state.admin.orders;
export const selectOrdersTotal = (state: RootState) => state.admin.ordersTotal;
export const selectOrdersPage = (state: RootState) => state.admin.ordersPage;
export const selectOrdersPages = (state: RootState) => state.admin.ordersPages;
export const selectOrdersLoading = (state: RootState) => state.admin.ordersLoading;

export const selectAdminMutatingId = (state: RootState) => state.admin.mutatingId;
export const selectLastResetPassword = (state: RootState) => state.admin.lastResetPassword;
export const selectAdminError = (state: RootState) => state.admin.error;
export const selectAdminSuccessMessage = (state: RootState) => state.admin.successMessage;