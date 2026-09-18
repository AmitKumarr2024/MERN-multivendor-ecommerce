"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  MessageSquareText,
  Send,
  Star,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
  fetchFeedbackEligibility,
  submitStaffFeedback,
} from "../store/staffSlice";

import { selectFeedbackEligibility } from "../store/staffSelectors";

import { RatingStars } from "@/features/reviews";

import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

interface StaffFeedbackFormProps {
  staffId: string;
}

export default function StaffFeedbackForm({
  staffId,
}: StaffFeedbackFormProps) {
  const dispatch = useAppDispatch();

  const eligibility = useAppSelector(
    selectFeedbackEligibility
  );

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] =
    useState(false);
  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    dispatch(fetchFeedbackEligibility(staffId));
  }, [dispatch, staffId]);

  /*
   * Still loading eligibility.
   */
  if (!eligibility) {
    return (
      <div className="animate-pulse rounded-3xl border border-default bg-surface p-5 sm:p-6">
        <div className="h-5 w-40 rounded-lg bg-surface-muted" />

        <div className="mt-4 h-4 w-56 rounded-lg bg-surface-muted" />

        <div className="mt-6 h-10 w-52 rounded-xl bg-surface-muted" />

        <div className="mt-5 h-24 rounded-2xl bg-surface-muted" />

        <div className="mt-4 h-10 w-32 rounded-xl bg-surface-muted" />
      </div>
    );
  }

  /*
   * Successful submission.
   */
  if (submitted) {
    return (
      <div className="overflow-hidden rounded-3xl border border-success-border bg-success-bg p-6 text-center sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-success-text shadow-sm">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <h3 className="mt-4 text-lg font-bold text-primary">
          Thanks for your feedback
        </h3>

        <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-secondary">
          Your feedback helps this shop improve the
          experience for future buyers.
        </p>
      </div>
    );
  }

  /*
   * Buyer is not eligible.
   */
  if (!eligibility.eligible) {
    const alreadyReviewed =
      eligibility.reason === "already_reviewed";

    return (
      <div className="rounded-3xl border border-default bg-surface p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-secondary">
            {alreadyReviewed ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <MessageSquareText className="h-5 w-5" />
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-primary">
              {alreadyReviewed
                ? "Feedback already submitted"
                : "Feedback isn't available yet"}
            </h3>

            <p className="mt-1 text-sm leading-6 text-secondary">
              {alreadyReviewed
                ? "You already gave feedback for this staff member."
                : "Only buyers with a delivered order from this shop can rate staff."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!eligibility.orderId || submitting) {
      return;
    }

    try {
      setSubmitting(true);

      await dispatch(
        submitStaffFeedback({
          staffId,
          orderId: eligibility.orderId,
          rating,
          comment: comment.trim(),
        })
      ).unwrap();

      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-default bg-surface shadow-sm">
      {/* =====================================================
                HEADER
            ===================================================== */}

      <div className="border-b border-default p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-primary">
            <MessageSquareText className="h-5 w-5" />
          </div>

          <div>
            <h3 className="text-base font-bold text-primary sm:text-lg">
              Share your experience
            </h3>

            <p className="mt-1 text-sm leading-5 text-secondary">
              How was your experience with this
              staff member?
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
                FORM
            ===================================================== */}

      <div className="space-y-6 p-5 sm:p-6">
        {/* Rating */}
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-primary">
                Your rating
              </p>

              <p className="mt-0.5 text-xs text-secondary">
                Tap a star to rate your experience.
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-full bg-surface-muted px-3 py-1.5">
              <Star className="h-3.5 w-3.5 fill-current text-warning-text" />

              <span className="text-xs font-bold text-primary">
                {rating}/5
              </span>
            </div>
          </div>

          <div className="flex w-fit rounded-2xl border border-default bg-surface-muted/40 px-4 py-3">
            <RatingStars
              value={rating}
              onChange={setRating}
            />
          </div>
        </div>

        {/* Comment */}
        <div>
          <div className="mb-2">
            <p className="text-sm font-semibold text-primary">
              Tell us more
              <span className="ml-1 font-normal text-muted">
                (optional)
              </span>
            </p>
          </div>

          <Textarea
            value={comment}
            onChange={(e) =>
              setComment(e.target.value)
            }
            maxLength={500}
            placeholder="What did you like about your experience?"
          />

          <div className="mt-2 flex justify-end">
            <span className="text-[11px] text-muted">
              {comment.length}/500
            </span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-secondary">
            Your feedback helps improve the shop
            experience.
          </p>

          <Button
            onClick={handleSubmit}
            loading={submitting}
            disabled={
              submitting ||
              !eligibility.orderId
            }
          >
            <span className="inline-flex items-center gap-2">
              <Send className="h-4 w-4" />
              Submit feedback
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}