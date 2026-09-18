import type { RootState } from "@/store/store";

export const selectReviews = (state: RootState) => state.reviews.items;
export const selectReviewsTotal = (state: RootState) => state.reviews.total;
export const selectReviewsPage = (state: RootState) => state.reviews.page;
export const selectReviewsPages = (state: RootState) => state.reviews.pages;
export const selectRatingBreakdown = (state: RootState) =>
  state.reviews.ratingBreakdown;
export const selectReviewsLoading = (state: RootState) =>
  state.reviews.listLoading;

export const selectReviewEligibility = (state: RootState) =>
  state.reviews.eligibility;
export const selectReviewEligibilityLoading = (state: RootState) =>
  state.reviews.eligibilityLoading;

export const selectReviewMutating = (state: RootState) =>
  state.reviews.mutating;
export const selectReviewError = (state: RootState) => state.reviews.error;
export const selectReviewSuccessMessage = (state: RootState) =>
  state.reviews.successMessage;
