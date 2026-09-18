"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    fetchProductReviews,
    fetchReviewEligibility,
    replyToReview,
    markReviewHelpful,
} from "../store/reviewSlice";
import {
    selectReviews,
    selectReviewsLoading,
    selectRatingBreakdown,
    selectReviewEligibility,
    selectReviewEligibilityLoading,
    selectReviewsPages,
    selectReviewsPage,
} from "../store/reviewSelectors";
import { selectCurrentUser } from "@/features/auth/store/authSelector";
import RatingSummary from "./RatingSummary";
import ReviewItem from "./ReviewItem";
import ReviewForm from "./ReviewForm";
import type { ReviewSort } from "../types/review.types";

interface ReviewListProps {
    productId: string;
    averageRating: number;
    reviewCount: number;
    sellerId?: string;
}

const SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
    { value: "newest", label: "Newest" },
    { value: "helpful", label: "Most helpful" },
    { value: "highest", label: "Highest rated" },
    { value: "lowest", label: "Lowest rated" },
];

export default function ReviewList({ productId, averageRating, reviewCount, sellerId }: ReviewListProps) {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectCurrentUser);
    const reviews = useAppSelector(selectReviews);
    const loading = useAppSelector(selectReviewsLoading);
    const breakdown = useAppSelector(selectRatingBreakdown);
    const eligibility = useAppSelector(selectReviewEligibility);
    const eligibilityLoading = useAppSelector(selectReviewEligibilityLoading);
    const page = useAppSelector(selectReviewsPage);
    const pages = useAppSelector(selectReviewsPages);

    const [sort, setSort] = useState<ReviewSort>("newest");
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        dispatch(fetchProductReviews({ productId, page: 1, sort }));
    }, [dispatch, productId, sort]);

    useEffect(() => {
        if (user) dispatch(fetchReviewEligibility(productId));
    }, [dispatch, productId, user]);

    const canReplyAsSeller = user && sellerId && user._id === sellerId;

    // Has this user already reviewed (eligibleOrders is empty, canReview false,
    // but they DO have a delivered order) vs never bought it at all?
    const alreadyReviewed =
        !eligibilityLoading &&
        eligibility &&
        !eligibility.canReview &&
        reviews.some((r) => r.buyer._id === user?._id);

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-primary">Ratings & Reviews</h2>

            <RatingSummary averageRating={averageRating} reviewCount={reviewCount} breakdown={breakdown} />

            {/* Review CTA / eligibility messaging - always show SOMETHING when
                logged in, so the absence of a button doesn't look like a bug */}
            {user && !eligibilityLoading && (
                <>
                    {eligibility?.canReview && !showForm && (
                        <button
                            type="button"
                            onClick={() => setShowForm(true)}
                            className="rounded-lg border border-accent px-4 py-2 text-sm font-medium text-accent"
                        >
                            Write a review
                        </button>
                    )}

                    {showForm && eligibility?.canReview && (
                        <ReviewForm
                            productId={productId}
                            eligibleOrders={eligibility.eligibleOrders}
                            onSubmitted={() => setShowForm(false)}
                        />
                    )}

                    {!eligibility?.canReview && alreadyReviewed && (
                        <p className="rounded-lg bg-surface-muted px-4 py-2.5 text-sm text-secondary">
                            You've already reviewed this product. Thanks for the feedback!
                        </p>
                    )}

                    {!eligibility?.canReview && !alreadyReviewed && (
                        <p className="rounded-lg bg-surface-muted px-4 py-2.5 text-sm text-secondary">
                            Only buyers with a <strong>delivered order</strong> for this product can leave
                            a review. Purchase this product and wait for delivery to write one.
                        </p>
                    )}
                </>
            )}

            {!user && (
                <p className="rounded-lg bg-surface-muted px-4 py-2.5 text-sm text-secondary">
                    <a href="/login" className="font-medium text-accent hover:underline">
                        Log in
                    </a>{" "}
                    to write a review after your order is delivered.
                </p>
            )}

            {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">Sort by:</span>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as ReviewSort)}
                        className="rounded-lg border border-default bg-surface px-2 py-1 text-xs text-primary"
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {loading && reviews.length === 0 ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-muted" />
                    ))}
                </div>
            ) : (
                reviews.length > 0 && (
                    <div className="rounded-xl border border-default bg-surface px-4">
                        {reviews.map((review) => (
                            <ReviewItem
                                key={review._id}
                                review={review}
                                canReply={!!canReplyAsSeller}
                                onReply={(id, text) => dispatch(replyToReview({ id, text }))}
                                onHelpful={(id) => dispatch(markReviewHelpful(id))}
                            />
                        ))}
                    </div>
                )
            )}

            {page < pages && (
                <button
                    type="button"
                    onClick={() => dispatch(fetchProductReviews({ productId, page: page + 1, sort }))}
                    className="text-sm text-blue-500 hover:underline"
                >
                    Load more reviews
                </button>
            )}
        </div>
    );
}