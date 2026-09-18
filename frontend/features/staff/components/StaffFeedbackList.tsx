"use client";

import { useEffect } from "react";
import {
  MessageSquareText,
  Star,
  UserRound,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { fetchStaffFeedback } from "../store/staffSlice";
import { selectStaffFeedback } from "../store/staffSelectors";

import { RatingStars } from "@/features/reviews";

interface StaffFeedbackListProps {
  staffId: string;
}

export default function StaffFeedbackList({
  staffId,
}: StaffFeedbackListProps) {
  const dispatch = useAppDispatch();

  const feedback = useAppSelector(
    selectStaffFeedback
  );

  useEffect(() => {
    dispatch(
      fetchStaffFeedback({
        staffId,
      })
    );
  }, [dispatch, staffId]);

  return (
    <section className="space-y-5">
      {/* =====================================================
                HEADER
            ===================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-muted" />

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Customer feedback
            </p>
          </div>

          <h2 className="mt-1 text-xl font-bold tracking-tight text-primary sm:text-2xl">
            What buyers say
          </h2>

          <p className="mt-1 text-sm text-secondary">
            Reviews and experiences shared by
            customers.
          </p>
        </div>

        {feedback.items.length > 0 && (
          <div className="flex w-fit items-center gap-2 rounded-full border border-default bg-surface-muted px-3 py-2">
            <Star className="h-4 w-4 fill-current text-warning-text" />

            <span className="text-sm font-bold text-primary">
              {feedback.items.length}
            </span>

            <span className="text-xs text-secondary">
              {feedback.items.length === 1
                ? "review"
                : "reviews"}
            </span>
          </div>
        )}
      </div>

      {/* =====================================================
                REVIEWS
            ===================================================== */}

      {feedback.items.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {feedback.items.map((item) => (
            <article
              key={item._id}
              className="group rounded-3xl border border-default bg-surface p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-6"
            >
              {/* Buyer */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  {/* Avatar */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface-muted text-secondary">
                    <UserRound className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-primary">
                      {item.buyer.name}
                    </p>

                    <p className="mt-0.5 text-xs text-muted">
                      Verified buyer
                    </p>
                  </div>
                </div>

                {/* Rating score */}
                <div className="flex shrink-0 items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1.5">
                  <Star className="h-3.5 w-3.5 fill-current text-warning-text" />

                  <span className="text-xs font-bold text-primary">
                    {item.rating}
                  </span>
                </div>
              </div>

              {/* Stars */}
              <div className="mt-4">
                <RatingStars
                  value={item.rating}
                  readOnly
                  size="sm"
                />
              </div>

              {/* Comment */}
              {item.comment ? (
                <div className="relative mt-4 rounded-2xl bg-surface-muted/50 p-4">
                  <span className="absolute -top-2 left-4 text-2xl leading-none text-muted">
                    “
                  </span>

                  <p className="pt-1 text-sm leading-6 text-secondary">
                    {item.comment}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-xs italic text-muted">
                  Buyer left a rating without a
                  written comment.
                </p>
              )}
            </article>
          ))}
        </div>
      ) : (
        /* =================================================
            EMPTY STATE
        ================================================= */

        <div className="rounded-3xl border border-dashed border-default bg-surface-muted/30 px-5 py-10 text-center sm:px-8 sm:py-14">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-muted shadow-sm">
            <MessageSquareText className="h-6 w-6" />
          </div>

          <h3 className="mt-4 text-base font-bold text-primary">
            No feedback yet
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-secondary">
            Customer feedback will appear here after
            buyers share their experience.
          </p>
        </div>
      )}
    </section>
  );
}