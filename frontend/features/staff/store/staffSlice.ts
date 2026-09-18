import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/services/axios"; // ⚠️ align to your real axios instance path
import type {
  Staff,
  MonthlyAttendance,
  StaffPerformance,
  StaffFeedback,
  FeedbackEligibility,
  CreateStaffPayload,
} from "../types/staff.types";

interface StaffState {
  roster: Staff[];
  publicRoster: Staff[];
  currentStaff: Staff | null;
  attendance: MonthlyAttendance | null;
  performance: StaffPerformance | null;
  feedback: {
    items: StaffFeedback[];
    total: number;
    page: number;
    pages: number;
  };
  eligibility: FeedbackEligibility | null;
  loading: boolean;
  error: string | null;
}

const initialState: StaffState = {
  roster: [],
  publicRoster: [],
  currentStaff: null,
  attendance: null,
  performance: null,
  feedback: { items: [], total: 0, page: 1, pages: 1 },
  eligibility: null,
  loading: false,
  error: null,
};

function buildStaffFormData(payload: CreateStaffPayload): FormData {
  const fd = new FormData();
  fd.append("name", payload.name);
  fd.append("role", payload.role);
  if (payload.bio) fd.append("bio", payload.bio);
  fd.append("joiningDate", payload.joiningDate);
  if (payload.profilePhoto) fd.append("profilePhoto", payload.profilePhoto);
  return fd;
}

// NOTE: generics kept single-line per this project's documented lesson —
// multi-line createAsyncThunk<...> generics have twice lost their `<` on
// paste (reviewSlice.ts, searchSlice.ts). Verify this survived your paste too.

export const fetchStaffRoster = createAsyncThunk<Staff[], string>(
  "staff/fetchRoster",
  async (shopId) => {
    const { data } = await axios.get(`/shops/${shopId}/staff`);

    console.log("=================================");
    console.log("👥 STAFF ROSTER RESPONSE");
    console.log("=================================");
    console.log("Shop ID:", shopId);
    console.log("Full response:", data);
    console.log("Staff data:", data.data);

    console.table(
      (data.data ?? []).map((staff: Staff) => ({
        id: staff._id,
        shop: staff.shop,
        name: staff.name,
        role: staff.role,
        isActive: staff.isActive,
        ratingAverage: staff.ratingAverage,
        feedbackCount: staff.feedbackCount,
        experience: staff.experience,
      })),
    );

    return data.data;
  },
);

export const fetchPublicStaffRoster = createAsyncThunk<Staff[], string>(
  "staff/fetchPublicRoster",
  async (shopId) => {
    const { data } = await axios.get(`/shops/${shopId}/staff/public`);
    return data.data;
  },
);

export const createStaffMember = createAsyncThunk<
  Staff,
  { shopId: string; payload: CreateStaffPayload }
>("staff/create", async ({ shopId, payload }) => {
  const { data } = await axios.post(
    `/shops/${shopId}/staff`,
    buildStaffFormData(payload),
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data.data;
});

export const updateStaffMember = createAsyncThunk<
  Staff,
  { staffId: string; payload: Partial<CreateStaffPayload> }
>("staff/update", async ({ staffId, payload }) => {
  const fd = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined) fd.append(key, value as string | Blob);
  });
  const { data } = await axios.put(`/staff/${staffId}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
});

export const setStaffStatus = createAsyncThunk<
  Staff,
  { staffId: string; isActive: boolean }
>("staff/setStatus", async ({ staffId, isActive }) => {
  const { data } = await axios.patch(`/staff/${staffId}/status`, { isActive });
  return data.data;
});

export const removeStaffMember = createAsyncThunk<string, string>(
  "staff/remove",
  async (staffId) => {
    await axios.delete(`/staff/${staffId}`);
    return staffId;
  },
);

export const markStaffAttendance = createAsyncThunk<
  void,
  { staffId: string; date: string; status: string; note?: string }
>("staff/markAttendance", async ({ staffId, ...body }) => {
  await axios.post(`/staff/${staffId}/attendance`, body);
});

export const fetchMonthlyAttendance = createAsyncThunk<
  MonthlyAttendance,
  { staffId: string; month: number; year: number }
>("staff/fetchAttendance", async ({ staffId, month, year }) => {
  const { data } = await axios.get(`/staff/${staffId}/attendance`, {
    params: { month, year },
  });
  return data.data;
});

export const fetchStaffPerformance = createAsyncThunk<
  StaffPerformance,
  { staffId: string; month: number; year: number }
>("staff/fetchPerformance", async ({ staffId, month, year }) => {
  const { data } = await axios.get(`/staff/${staffId}/performance`, {
    params: { month, year },
  });
  return data.data;
});

export const fetchFeedbackEligibility = createAsyncThunk<
  FeedbackEligibility,
  string
>("staff/fetchEligibility", async (staffId) => {
  const { data } = await axios.get(`/staff/${staffId}/feedback/eligibility`);
  return data.data;
});

export const submitStaffFeedback = createAsyncThunk<
  void,
  { staffId: string; orderId: string; rating: number; comment?: string }
>("staff/submitFeedback", async ({ staffId, ...body }) => {
  await axios.post(`/staff/${staffId}/feedback`, body);
});

export const fetchStaffFeedback = createAsyncThunk<
  { items: StaffFeedback[]; total: number; page: number; pages: number },
  { staffId: string; page?: number }
>("staff/fetchFeedback", async ({ staffId, page = 1 }) => {
  const { data } = await axios.get(`/staff/${staffId}/feedback`, {
    params: { page },
  });
  return data.data;
});

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    clearCurrentStaff: (state) => {
      state.currentStaff = null;
      state.attendance = null;
      state.performance = null;
    },
    clearEligibility: (state) => {
      state.eligibility = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        fetchStaffRoster.fulfilled,
        (state, action: PayloadAction<Staff[]>) => {
          state.roster = action.payload;
        },
      )
      .addCase(
        fetchPublicStaffRoster.fulfilled,
        (state, action: PayloadAction<Staff[]>) => {
          state.publicRoster = action.payload;
        },
      )
      .addCase(
        createStaffMember.fulfilled,
        (state, action: PayloadAction<Staff>) => {
          state.roster.unshift(action.payload);
        },
      )
      .addCase(
        updateStaffMember.fulfilled,
        (state, action: PayloadAction<Staff>) => {
          state.roster = state.roster.map((s) =>
            s._id === action.payload._id ? action.payload : s,
          );
          state.currentStaff = action.payload;
        },
      )
      .addCase(
        setStaffStatus.fulfilled,
        (state, action: PayloadAction<Staff>) => {
          state.roster = state.roster.map((s) =>
            s._id === action.payload._id ? action.payload : s,
          );
        },
      )
      .addCase(
        removeStaffMember.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.roster = state.roster.filter((s) => s._id !== action.payload);
        },
      )
      .addCase(
        fetchMonthlyAttendance.fulfilled,
        (state, action: PayloadAction<MonthlyAttendance>) => {
          state.attendance = action.payload;
        },
      )
      .addCase(
        fetchStaffPerformance.fulfilled,
        (state, action: PayloadAction<StaffPerformance>) => {
          state.performance = action.payload;
        },
      )
      .addCase(
        fetchFeedbackEligibility.fulfilled,
        (state, action: PayloadAction<FeedbackEligibility>) => {
          state.eligibility = action.payload;
        },
      )
      .addCase(fetchStaffFeedback.fulfilled, (state, action) => {
        state.feedback = action.payload;
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("staff/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("staff/") &&
          action.type.endsWith("/fulfilled"),
        (state) => {
          state.loading = false;
        },
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("staff/") && action.type.endsWith("/rejected"),
        (state, action: any) => {
          state.loading = false;
          state.error = action.error?.message ?? "Something went wrong";
        },
      );
  },
});

export const { clearCurrentStaff, clearEligibility } = staffSlice.actions;
export default staffSlice.reducer;
