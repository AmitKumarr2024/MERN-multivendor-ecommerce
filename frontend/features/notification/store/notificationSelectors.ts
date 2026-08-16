import type { RootState } from "@/store/store";

export const selectAllNotifications = (state: RootState) =>
  state.notification.items;

export const selectUnreadNotifications = (state: RootState) =>
  state.notification.items.filter((n) => !n.isRead);

export const selectUnreadCount = (state: RootState) =>
  state.notification.unreadCount;

export const selectNotificationLoading = (state: RootState) =>
  state.notification.loading;

export const selectNotificationError = (state: RootState) =>
  state.notification.error;

export const selectHasMoreNotifications = (state: RootState) =>
  state.notification.page < state.notification.pages;

// Cheap client-side lookup, same pattern as wishlist's selectIsWishlisted —
// avoids a network call just to check one notification's read state.
export const selectNotificationById = (id: string) => (state: RootState) =>
  state.notification.items.find((n) => n._id === id);