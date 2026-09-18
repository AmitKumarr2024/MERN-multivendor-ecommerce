"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Check,
    CheckCircle2,
    Circle,
    Users,
    X,
    XCircle,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
    fetchStaffRoster,
    markStaffAttendance,
} from "../store/staffSlice";

import {
    selectStaffRoster,
    selectStaffLoading,
} from "../store/staffSelectors";

interface StaffRosterCardProps {
    shopId: string;
}

type AttendanceStatus = "present" | "absent";

export default function StaffRosterCard({
    shopId,
}: StaffRosterCardProps) {
    const dispatch = useAppDispatch();

    const roster = useAppSelector(selectStaffRoster);
    const loading = useAppSelector(selectStaffLoading);

    const [markedToday, setMarkedToday] = useState<
        Record<string, AttendanceStatus>
    >({});

    const [savingStaff, setSavingStaff] = useState<
        Record<string, boolean>
    >({});

    useEffect(() => {
        dispatch(fetchStaffRoster(shopId));
    }, [dispatch, shopId]);

    const activeStaff = useMemo(
        () => roster.filter((staff) => staff.isActive),
        [roster]
    );

    const presentCount = activeStaff.filter(
        (staff) => markedToday[staff._id] === "present"
    ).length;

    const absentCount = activeStaff.filter(
        (staff) => markedToday[staff._id] === "absent"
    ).length;

    const unmarkedCount =
        activeStaff.length -
        presentCount -
        absentCount;

    const today = new Date()
        .toISOString()
        .slice(0, 10);

    const mark = async (
        staffId: string,
        status: AttendanceStatus
    ) => {
        const previousStatus = markedToday[staffId];

        setMarkedToday((prev) => ({
            ...prev,
            [staffId]: status,
        }));

        setSavingStaff((prev) => ({
            ...prev,
            [staffId]: true,
        }));

        try {
            await dispatch(
                markStaffAttendance({
                    staffId,
                    date: today,
                    status,
                })
            ).unwrap();
        } catch {
            setMarkedToday((prev) => {
                const next = { ...prev };

                if (previousStatus) {
                    next[staffId] = previousStatus;
                } else {
                    delete next[staffId];
                }

                return next;
            });
        } finally {
            setSavingStaff((prev) => ({
                ...prev,
                [staffId]: false,
            }));
        }
    };

    return (
        <section className="overflow-hidden rounded-3xl border border-default bg-surface shadow-sm">
            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="border-b border-default bg-surface-muted/20 px-4 py-4 sm:px-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                            <Users className="h-4.5 w-4.5" />
                        </div>

                        <div className="min-w-0">
                            <h2 className="truncate text-sm font-bold text-primary">
                                Today&apos;s roster
                            </h2>

                            <p className="mt-0.5 text-[11px] text-muted">
                                {activeStaff.length}{" "}
                                {activeStaff.length === 1
                                    ? "team member"
                                    : "team members"}{" "}
                                today
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/seller/shop"
                        className="inline-flex shrink-0 items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-semibold text-info-text transition hover:bg-surface-muted"
                    >
                        Manage
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                {/* =================================================
                    SUMMARY
                ================================================= */}

                {activeStaff.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                        <SummaryItem
                            label="Present"
                            value={presentCount}
                            type="present"
                        />

                        <SummaryItem
                            label="Absent"
                            value={absentCount}
                            type="absent"
                        />

                        <SummaryItem
                            label="Pending"
                            value={unmarkedCount}
                            type="pending"
                        />
                    </div>
                )}
            </div>

            {/* =====================================================
                ROSTER
            ===================================================== */}

            <div className="p-3 sm:p-4">
                {loading && activeStaff.length === 0 ? (
                    <RosterSkeleton />
                ) : activeStaff.length === 0 ? (
                    <EmptyRoster />
                ) : (
                    <div className="space-y-2">
                        {activeStaff.map((member) => {
                            const status =
                                markedToday[member._id];

                            const isSaving =
                                savingStaff[member._id] ??
                                false;

                            const photoUrl =
                                member.profilePhoto?.url ??
                                null;

                            return (
                                <div
                                    key={member._id}
                                    className={`group rounded-2xl border p-3 transition-all duration-200 ${status === "present"
                                            ? "border-success-text/20 bg-success-bg/30"
                                            : status === "absent"
                                                ? "border-danger-text/20 bg-danger-bg/30"
                                                : "border-transparent hover:border-default hover:bg-surface-hover"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* =================================================
                                            AVATAR
                                        ================================================= */}

                                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-default bg-surface-muted">
                                            {photoUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={photoUrl}
                                                    alt={
                                                        member.name
                                                    }
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-secondary">
                                                    {member.name
                                                        .charAt(
                                                            0
                                                        )
                                                        .toUpperCase()}
                                                </div>
                                            )}

                                            {/* Online / active indicator */}
                                            <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-success-text" />
                                        </div>

                                        {/* =================================================
                                            INFO
                                        ================================================= */}

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate text-sm font-semibold text-primary">
                                                    {
                                                        member.name
                                                    }
                                                </p>

                                                {status ===
                                                    "present" && (
                                                        <span className="hidden shrink-0 rounded-full bg-success-bg px-1.5 py-0.5 text-[9px] font-bold text-success-text sm:inline-flex">
                                                            Present
                                                        </span>
                                                    )}

                                                {status ===
                                                    "absent" && (
                                                        <span className="hidden shrink-0 rounded-full bg-danger-bg px-1.5 py-0.5 text-[9px] font-bold text-danger-text sm:inline-flex">
                                                            Absent
                                                        </span>
                                                    )}
                                            </div>

                                            <p className="truncate text-[11px] text-muted">
                                                {member.role ||
                                                    "Team member"}
                                            </p>
                                        </div>

                                        {/* =================================================
                                            ATTENDANCE ACTIONS
                                        ================================================= */}

                                        <div className="flex shrink-0 items-center gap-1.5">
                                            <AttendanceButton
                                                active={
                                                    status ===
                                                    "present"
                                                }
                                                loading={
                                                    isSaving
                                                }
                                                type="present"
                                                onClick={() =>
                                                    mark(
                                                        member._id,
                                                        "present"
                                                    )
                                                }
                                            />

                                            <AttendanceButton
                                                active={
                                                    status ===
                                                    "absent"
                                                }
                                                loading={
                                                    isSaving
                                                }
                                                type="absent"
                                                onClick={() =>
                                                    mark(
                                                        member._id,
                                                        "absent"
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* =====================================================
                FOOTER
            ===================================================== */}

            {activeStaff.length > 0 && (
                <div className="border-t border-default px-4 py-3">
                    <div className="flex flex-col gap-2 text-[11px] sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 text-success-text">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {presentCount} present
                            </span>

                            <span className="inline-flex items-center gap-1.5 text-danger-text">
                                <XCircle className="h-3.5 w-3.5" />
                                {absentCount} absent
                            </span>
                        </div>

                        {unmarkedCount > 0 ? (
                            <span className="text-muted">
                                {unmarkedCount} still unmarked
                            </span>
                        ) : (
                            <span className="font-semibold text-success-text">
                                All attendance marked
                            </span>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}

/* =============================================================
   ATTENDANCE BUTTON
============================================================= */

function AttendanceButton({
    type,
    active,
    loading,
    onClick,
}: {
    type: AttendanceStatus;
    active: boolean;
    loading: boolean;
    onClick: () => void;
}) {
    const isPresent = type === "present";

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={loading}
            aria-label={
                isPresent
                    ? "Mark present"
                    : "Mark absent"
            }
            title={
                isPresent
                    ? "Mark present"
                    : "Mark absent"
            }
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${active
                    ? isPresent
                        ? "bg-success-bg text-success-text shadow-sm"
                        : "bg-danger-bg text-danger-text shadow-sm"
                    : "bg-surface-muted text-muted hover:bg-surface-muted hover:text-primary"
                }`}
        >
            {loading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : isPresent ? (
                active ? (
                    <Check className="h-4 w-4" />
                ) : (
                    <CheckCircle2 className="h-4 w-4" />
                )
            ) : active ? (
                <X className="h-4 w-4" />
            ) : (
                <XCircle className="h-4 w-4" />
            )}
        </button>
    );
}

/* =============================================================
   SUMMARY ITEM
============================================================= */

function SummaryItem({
    label,
    value,
    type,
}: {
    label: string;
    value: number;
    type: "present" | "absent" | "pending";
}) {
    const Icon =
        type === "present"
            ? CheckCircle2
            : type === "absent"
                ? XCircle
                : Circle;

    const iconClass =
        type === "present"
            ? "text-success-text"
            : type === "absent"
                ? "text-danger-text"
                : "text-muted";

    return (
        <div className="rounded-2xl border border-default bg-surface px-3 py-2.5">
            <div className="flex items-center gap-1.5">
                <Icon
                    className={`h-3.5 w-3.5 ${iconClass}`}
                />

                <span className="text-[10px] font-semibold text-muted">
                    {label}
                </span>
            </div>

            <p className="mt-1 text-lg font-bold leading-none text-primary">
                {value}
            </p>
        </div>
    );
}

/* =============================================================
   SKELETON
============================================================= */

function RosterSkeleton() {
    return (
        <div className="space-y-2">
            {Array.from({ length: 4 }).map(
                (_, index) => (
                    <div
                        key={index}
                        className="flex h-16.5 animate-pulse items-center gap-3 rounded-2xl bg-surface-muted px-3"
                    >
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-surface" />

                        <div className="flex-1 space-y-2">
                            <div className="h-3.5 w-28 rounded bg-surface" />
                            <div className="h-2.5 w-20 rounded bg-surface" />
                        </div>

                        <div className="flex gap-1.5">
                            <div className="h-8 w-8 rounded-xl bg-surface" />
                            <div className="h-8 w-8 rounded-xl bg-surface" />
                        </div>
                    </div>
                )
            )}
        </div>
    );
}

/* =============================================================
   EMPTY STATE
============================================================= */

function EmptyRoster() {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-default bg-surface-muted/20 px-4 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-muted shadow-sm">
                <Users className="h-5 w-5" />
            </div>

            <p className="mt-4 text-sm font-bold text-primary">
                No active staff
            </p>

            <p className="mt-1 max-w-55 text-xs leading-5 text-muted">
                Add team members to start tracking
                daily attendance.
            </p>

            <Link
                href="/seller/shop"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-surface px-3 py-2 text-xs font-semibold text-info-text shadow-sm transition hover:bg-surface-hover"
            >
                Add staff
                <ArrowRight className="h-3.5 w-3.5" />
            </Link>
        </div>
    );
}