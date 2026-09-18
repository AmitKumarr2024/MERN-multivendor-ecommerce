import type { RootState } from "@/store/store"; // ⚠️ align to your real store path

export const selectStaffRoster = (state: RootState) => state.staff.roster;
export const selectPublicStaffRoster = (state: RootState) =>
  state.staff.publicRoster;
export const selectCurrentStaff = (state: RootState) =>
  state.staff.currentStaff;
export const selectStaffAttendance = (state: RootState) =>
  state.staff.attendance;
export const selectStaffPerformance = (state: RootState) =>
  state.staff.performance;
export const selectStaffFeedback = (state: RootState) => state.staff.feedback;
export const selectFeedbackEligibility = (state: RootState) =>
  state.staff.eligibility;
export const selectStaffLoading = (state: RootState) => state.staff.loading;
export const selectStaffError = (state: RootState) => state.staff.error;
