import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/services/axios";
import type {
  Notification,
  NotificationListResponse,
  FetchNotificationsParams,
} from "../types/notification.types";

interface NotificationState {
  items: Notification[];
  unreadCount: number;
  total: number;
  page: number;
  pages: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  total: 0,
  page: 1,
  pages: 1,
  loading: false,
  error: null,
};

// -----------------------------------------------------------------
// THUNKS
// -----------------------------------------------------------------

export const fetchNotifications = createAsyncThunk(
  "notification/fetchAll",
  async (params: FetchNotificationsParams | undefined, { rejectWithValue }) => {
    try {
      const response = await axios.get("/notifications", { params });
      const data: NotificationListResponse = response.data;
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load notifications",
      );
    }
  },
);

export const fetchUnreadCount = createAsyncThunk(
  "notification/fetchUnreadCount",
  async (_: void, { rejectWithValue }) => {
    try {
      const response = await axios.get("/notifications/unread-count");
      const count: number = response.data.count;
      return count;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to load unread count",
      );
    }
  },
);

export const markNotificationRead = createAsyncThunk(
  "notification/markRead",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/notifications/${id}/read`);
      const data: Notification = response.data;
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to mark as read",
      );
    }
  },
);

export const markAllNotificationsRead = createAsyncThunk(
  "notification/markAllRead",
  async (_: void, { rejectWithValue }) => {
    try {
      await axios.patch("/notifications/mark-all-read");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to mark all as read",
      );
    }
  },
);

export const deleteNotification = createAsyncThunk(
  "notification/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/notifications/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete notification",
      );
    }
  },
);

// -----------------------------------------------------------------
// SLICE
// -----------------------------------------------------------------

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    notificationReceived: (state, action: PayloadAction<Notification>) => {
      const exists = state.items.some((n) => n._id === action.payload._id);
      if (!exists) {
        state.items.unshift(action.payload);
        state.total += 1;
      }
      state.unreadCount += 1;
    },
    resetNotificationState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items =
          action.payload.page === 1
            ? action.payload.notifications
            : [...state.items, ...action.payload.notifications];
        state.unreadCount = action.payload.unreadCount;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notification = state.items.find(
          (n) => n._id === action.payload._id,
        );
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((n) => (n.isRead = true));
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.items.find((n) => n._id === action.payload);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items = state.items.filter((n) => n._id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      });
  },
});

export const { notificationReceived, resetNotificationState } =
  notificationSlice.actions;
export default notificationSlice.reducer;
