import type { RootState } from "@/store/store";

export const selectMyOrders = (state: RootState) => state.order.myOrders;
export const selectMyOrdersTotal = (state: RootState) => state.order.myOrdersTotal;
export const selectMyOrdersPage = (state: RootState) => state.order.myOrdersPage;
export const selectMyOrdersPages = (state: RootState) => state.order.myOrdersPages;
export const selectMyOrdersLoading = (state: RootState) => state.order.myOrdersLoading;

export const selectShopOrders = (state: RootState) => state.order.shopOrders;
export const selectShopOrdersTotal = (state: RootState) => state.order.shopOrdersTotal;
export const selectShopOrdersPage = (state: RootState) => state.order.shopOrdersPage;
export const selectShopOrdersPages = (state: RootState) => state.order.shopOrdersPages;
export const selectShopOrdersLoading = (state: RootState) => state.order.shopOrdersLoading;

export const selectCurrentOrder = (state: RootState) => state.order.currentOrder;
export const selectOrderLoading = (state: RootState) => state.order.orderLoading;

export const selectMutatingOrderId = (state: RootState) => state.order.mutatingOrderId;
export const selectOrderError = (state: RootState) => state.order.error;
export const selectOrderSuccessMessage = (state: RootState) => state.order.successMessage;

/** Quick counts for dashboard cards - derived, not a separate API call. */
export const selectShopOrderCounts = (state: RootState) => {
    const orders = state.order.shopOrders;
    return {
        pending: orders.filter((o) => o.orderStatus === "pending").length,
        confirmed: orders.filter((o) => o.orderStatus === "confirmed").length,
        shipped: orders.filter((o) => o.orderStatus === "shipped").length,
        delivered: orders.filter((o) => o.orderStatus === "delivered").length,
        cancelled: orders.filter((o) => o.orderStatus === "cancelled").length,
    };
};