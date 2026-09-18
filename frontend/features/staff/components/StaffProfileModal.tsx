"use client";

import { X, BriefcaseBusiness, MessageSquare } from "lucide-react";

import type { Staff } from "../types/staff.types";

import { RatingStars } from "@/features/reviews";

import StaffFeedbackList from "./StaffFeedbackList";
import StaffFeedbackForm from "./StaffFeedbackForm";

interface StaffProfileModalProps {
    staff: Staff;
    onClose: () => void;
}

export default function StaffProfileModal({
    staff,
    onClose,
}: StaffProfileModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
            {/* =========================================================
                BACKDROP
               ========================================================= */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* =========================================================
                MODAL
               ========================================================= */}
            <div className="relative z-10 flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-default bg-surface shadow-2xl sm:max-h-[88vh] sm:rounded-3xl">
                {/* =====================================================
                    HEADER / CLOSE
                   ===================================================== */}
                <div className="relative shrink-0 border-b border-default px-5 py-5 sm:px-6">
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close staff profile"
                        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-secondary transition-colors hover:bg-surface-hover hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent/20"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    {/* =================================================
                        PROFILE
                       ================================================= */}
                    <div className="flex items-center gap-4 pr-10">
                        {/* Avatar */}
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-surface-muted ring-1 ring-default">
                            {staff.profilePhoto.url ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={staff.profilePhoto.url}
                                    alt={staff.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-accent/10 text-xl font-bold text-accent">
                                    {staff.name
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Identity */}
                        <div className="min-w-0">
                            <h2 className="truncate text-lg font-bold text-primary sm:text-xl">
                                {staff.name}
                            </h2>

                            <div className="mt-0.5 flex items-center gap-1.5 text-sm text-secondary">
                                <BriefcaseBusiness className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">
                                    {staff.role}
                                </span>
                            </div>

                            {staff.experience && (
                                <p className="mt-1 text-xs text-muted">
                                    {staff.experience} with this shop
                                </p>
                            )}
                        </div>
                    </div>

                    {/* =================================================
                        RATING
                       ================================================= */}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <RatingStars
                                value={staff.ratingAverage}
                                readOnly
                                size="sm"
                            />

                            <span className="text-sm font-semibold text-primary">
                                {staff.ratingAverage.toFixed(1)}
                            </span>
                        </div>

                        <span className="h-1 w-1 rounded-full bg-muted" />

                        <span className="text-xs text-muted">
                            {staff.feedbackCount} review
                            {staff.feedbackCount !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                {/* =====================================================
                    SCROLLABLE CONTENT
                   ===================================================== */}
                <div className="min-h-0 flex-1 overflow-y-auto">
                    {/* =================================================
                        BIO
                       ================================================= */}
                    {staff.bio && (
                        <div className="px-5 pt-5 sm:px-6">
                            <div className="rounded-2xl bg-surface-muted px-4 py-3.5">
                                <p className="text-sm leading-6 text-secondary">
                                    {staff.bio}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* =================================================
                        LEAVE FEEDBACK
                       ================================================= */}
                    <section className="px-5 py-5 sm:px-6">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                                <MessageSquare className="h-4 w-4" />
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-primary">
                                    Leave feedback
                                </h3>

                                <p className="text-[11px] text-muted">
                                    Share your experience
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-default bg-surface p-4">
                            <StaffFeedbackForm staffId={staff._id} />
                        </div>
                    </section>

                    {/* =================================================
                        CUSTOMER FEEDBACK
                       ================================================= */}
                    <section className="border-t border-default px-5 py-5 sm:px-6">
                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-primary">
                                What customers say
                            </h3>

                            <p className="mt-0.5 text-xs text-muted">
                                Feedback from other customers
                            </p>
                        </div>

                        <StaffFeedbackList staffId={staff._id} />
                    </section>
                </div>
            </div>
        </div>
    );
}