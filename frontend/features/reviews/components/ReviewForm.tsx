"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createReview } from "../store/reviewSlice";
import { selectReviewMutating } from "../store/reviewSelectors";
import RatingStars from "./RatingStars";
import type { EligibleOrder } from "../types/review.types";

interface ReviewFormProps {
    productId: string;
    eligibleOrders: EligibleOrder[];
    onSubmitted?: () => void;
}

export default function ReviewForm({ productId, eligibleOrders, onSubmitted }: ReviewFormProps) {
    const dispatch = useAppDispatch();
    const mutating = useAppSelector(selectReviewMutating);

    const [orderId, setOrderId] = useState(eligibleOrders[0]?.orderId ?? "");
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!rating) {
            setLocalError("Please select a star rating.");
            return;
        }
        if (!orderId) {
            setLocalError("Select which order this review is for.");
            return;
        }

        const result = await dispatch(
            createReview({ productId, orderId, rating, comment: comment.trim() || undefined }),
        );

        if (createReview.fulfilled.match(result)) {
            setRating(0);
            setComment("");
            onSubmitted?.();
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-3 rounded-xl border border-default bg-surface p-4"
        >
            <h3 className="text-sm font-semibold text-primary">Write a review</h3>

            {localError && (
                <div className="rounded-lg bg-danger-bg px-3 py-2 text-xs text-danger-text">
                    {localError}
                </div>
            )}

            {eligibleOrders.length > 1 && (
                <div>
                    <label className="mb-1 block text-xs font-medium text-secondary">
                        Which order?
                    </label>
                    <select
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        className="w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary"
                    >
                        {eligibleOrders.map((o) => (
                            <option key={o.orderId} value={o.orderId}>
                                Delivered on {new Date(o.deliveredOn).toLocaleDateString("en-IN")}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div>
                <label className="mb-1 block text-xs font-medium text-secondary">Your rating</label>
                <RatingStars value={rating} size="lg" interactive onChange={setRating} />
            </div>

            <div>
                <label className="mb-1 block text-xs font-medium text-secondary">
                    Comment (optional)
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder="Share your experience with this product..."
                    className="w-full resize-none rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary"
                />
            </div>

            <button
                type="submit"
                disabled={mutating}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
            >
                {mutating ? "Submitting..." : "Submit review"}
            </button>
        </form>
    );
}