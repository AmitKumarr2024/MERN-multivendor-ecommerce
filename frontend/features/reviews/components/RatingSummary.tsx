"use client";

import RatingStars from "./RatingStars";
import type { RatingBreakdown } from "../types/review.types";

interface RatingSummaryProps {
    averageRating: number;
    reviewCount: number;
    breakdown: RatingBreakdown;
}

export default function RatingSummary({
    averageRating,
    reviewCount,
    breakdown,
}: RatingSummaryProps) {
    if (reviewCount === 0) {
        return (
            <div className="rounded-xl border border-default bg-surface p-4 text-sm text-secondary">
                No reviews yet — be the first to review this product.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-default bg-surface p-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex shrink-0 flex-col items-center gap-1">
                <span className="text-3xl font-bold text-primary">{averageRating.toFixed(1)}</span>
                <RatingStars value={averageRating} size="sm" />
                <span className="text-xs text-muted">{reviewCount} reviews</span>
            </div>

            <div className="flex-1 space-y-1">
                {([5, 4, 3, 2, 1] as const).map((star) => {
                    const count = breakdown[star];
                    const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                    return (
                        <div key={star} className="flex items-center gap-2 text-xs text-secondary">
                            <span className="w-8 shrink-0">{star}★</span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                                <div
                                    className="h-full rounded-full bg-amber-400"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <span className="w-6 shrink-0 text-right">{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}