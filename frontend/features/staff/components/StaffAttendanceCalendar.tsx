"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  TrendingUp,
  UserX,
  X,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
  markStaffAttendance,
  fetchMonthlyAttendance,
} from "../store/staffSlice";

import { selectStaffAttendance } from "../store/staffSelectors";

import Button from "@/components/ui/Button";

const STATUS_OPTIONS = [
  "present",
  "absent",
  "leave",
] as const;

type AttendanceStatus = (typeof STATUS_OPTIONS)[number];

const STATUS_CONFIG: Record<
  AttendanceStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
    className: string;
    activeClassName: string;
  }
> = {
  present: {
    label: "Present",
    icon: CheckCircle2,
    className:
      "border-success-border bg-success-bg text-success-text",
    activeClassName:
      "border-success-border bg-success-bg text-success-text ring-2 ring-success-text/20",
  },

  absent: {
    label: "Absent",
    icon: UserX,
    className:
      "border-danger-border bg-danger-bg text-danger-text",
    activeClassName:
      "border-danger-border bg-danger-bg text-danger-text ring-2 ring-danger-text/20",
  },

  leave: {
    label: "Leave",
    icon: Clock3,
    className:
      "border-warning-border bg-warning-bg text-warning-text",
    activeClassName:
      "border-warning-border bg-warning-bg text-warning-text ring-2 ring-warning-text/20",
  },
};

export default function StaffAttendanceCalendar({
  staffId,
}: {
  staffId: string;
}) {
  const dispatch = useAppDispatch();

  const attendance = useAppSelector(selectStaffAttendance);

  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [todayStatus, setTodayStatus] =
    useState<AttendanceStatus>("present");

  const [isMarking, setIsMarking] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  /*
   * Fetch attendance when staff/month changes.
   */
  useEffect(() => {
    dispatch(
      fetchMonthlyAttendance({
        staffId,
        month,
        year,
      })
    );
  }, [dispatch, staffId, month, year]);

  /*
   * Close modal with Escape.
   */
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  /*
   * Prevent page scrolling while modal is open.
   */
  useEffect(() => {
    if (!isModalOpen) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isModalOpen]);

  /*
   * Month name.
   */
  const monthName = useMemo(
    () =>
      new Date(year, month - 1, 1).toLocaleString("default", {
        month: "long",
      }),
    [month, year]
  );

  /*
   * Current month.
   */
  const isCurrentMonth =
    month === now.getMonth() + 1 &&
    year === now.getFullYear();

  /*
   * Change month.
   */
  const changeMonth = (direction: -1 | 1) => {
    if (direction === -1) {
      if (month === 1) {
        setMonth(12);
        setYear((current) => current - 1);
      } else {
        setMonth((current) => current - 1);
      }

      return;
    }

    if (month === 12) {
      setMonth(1);
      setYear((current) => current + 1);
    } else {
      setMonth((current) => current + 1);
    }
  };

  /*
   * Go to current month.
   */
  const goToCurrentMonth = () => {
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
  };

  /*
   * Mark today's attendance.
   */
  const markToday = async () => {
    try {
      setIsMarking(true);

      const today = new Date()
        .toISOString()
        .slice(0, 10);

      await dispatch(
        markStaffAttendance({
          staffId,
          date: today,
          status: todayStatus,
        })
      ).unwrap();

      await dispatch(
        fetchMonthlyAttendance({
          staffId,
          month,
          year,
        })
      );
    } finally {
      setIsMarking(false);
    }
  };

  const attendancePercentage =
    attendance?.attendancePercentage ?? 0;

  const safePercentage = Math.min(
    Math.max(attendancePercentage, 0),
    100
  );

  return (
    <>
      {/* =====================================================
          COMPACT ATTENDANCE CARD
          This stays inside the staff card.
      ====================================================== */}

      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="mt-4 flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-default bg-surface-muted/40 px-3 py-3 text-left transition hover:border-primary/30 hover:bg-surface-muted"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface text-primary shadow-sm">
            <CalendarDays className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-primary">
              Attendance
            </p>

            <p className="mt-0.5 truncate text-[10px] text-secondary">
              Track monthly attendance
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {attendance && (
            <span className="rounded-full bg-success-bg px-2 py-1 text-[10px] font-semibold text-success-text">
              {safePercentage}%
            </span>
          )}

          <ChevronRight className="h-4 w-4 text-muted" />
        </div>
      </button>

      {/* =====================================================
          ATTENDANCE MODAL
      ====================================================== */}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="attendance-modal-title"
            className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-default bg-surface shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* =================================================
                MODAL HEADER
            ================================================== */}

            <div className="flex shrink-0 items-center justify-between border-b border-default px-4 py-4 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-primary">
                  <CalendarDays className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h2
                    id="attendance-modal-title"
                    className="truncate text-base font-bold text-primary"
                  >
                    Staff Attendance
                  </h2>

                  <p className="mt-0.5 truncate text-xs text-secondary">
                    {monthName} {year}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close attendance"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-default bg-surface text-secondary transition hover:bg-surface-muted hover:text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* =================================================
                MODAL CONTENT
            ================================================== */}

            <div className="overflow-y-auto">
              {/* Monthly Overview */}
              <div className="border-b border-default p-4 sm:p-5">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Monthly overview
                    </p>

                    <h3 className="mt-1 text-sm font-bold text-primary">
                      {monthName} performance
                    </h3>
                  </div>

                  {isCurrentMonth && (
                    <span className="rounded-full bg-success-bg px-2.5 py-1 text-[10px] font-semibold text-success-text">
                      Current month
                    </span>
                  )}
                </div>

                {attendance ? (
                  <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      <StatCard
                        label="Working days"
                        value={attendance.totalWorkingDays}
                        icon={CalendarDays}
                      />

                      <StatCard
                        label="Present"
                        value={attendance.presentDays}
                        icon={CheckCircle2}
                        accent="success"
                      />

                      <StatCard
                        label="Absent"
                        value={attendance.absentDays}
                        icon={UserX}
                        accent="danger"
                      />

                      <StatCard
                        label="Attendance"
                        value={`${safePercentage}%`}
                        icon={TrendingUp}
                        accent="info"
                      />
                    </div>

                    {/* Progress */}
                    <div className="mt-4 rounded-xl border border-default bg-surface-muted/40 p-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-primary">
                            Attendance rate
                          </p>

                          <p className="mt-0.5 text-[10px] text-secondary">
                            Based on working days this month
                          </p>
                        </div>

                        <span className="text-sm font-bold text-primary">
                          {safePercentage}%
                        </span>
                      </div>

                      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-surface-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{
                            width: `${safePercentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-default bg-surface-muted/30 px-4 py-8 text-center">
                    <CalendarDays className="mx-auto h-6 w-6 text-muted" />

                    <p className="mt-2 text-xs font-semibold text-primary">
                      No attendance data
                    </p>

                    <p className="mx-auto mt-1 max-w-xs text-[10px] leading-4 text-secondary">
                      Attendance information for this month
                      will appear here once records are available.
                    </p>
                  </div>
                )}
              </div>

              {/* Today's Attendance */}
              <div className="border-b border-default p-4 sm:p-5">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-primary">
                    Today's attendance
                  </h3>

                  <p className="mt-0.5 text-[11px] text-secondary">
                    Select the current attendance status and save it.
                  </p>
                </div>

                {/* Status */}
                <div className="grid grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map((status) => {
                    const config = STATUS_CONFIG[status];

                    const Icon = config.icon;

                    const isActive =
                      todayStatus === status;

                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          setTodayStatus(status)
                        }
                        className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${isActive
                            ? config.activeClassName
                            : "border-default bg-surface text-secondary hover:bg-surface-muted hover:text-primary"
                          }`}
                      >
                        <Icon className="h-3.5 w-3.5" />

                        {config.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3">
                  <Button
                    size="sm"
                    onClick={markToday}
                    loading={isMarking}
                  >
                    Mark today's attendance
                  </Button>
                </div>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between px-4 py-3 sm:px-5">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  aria-label="Previous month"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-default bg-surface text-secondary transition hover:bg-surface-muted hover:text-primary"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={goToCurrentMonth}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-secondary transition hover:bg-surface-muted hover:text-primary"
                >
                  {monthName} {year}
                </button>

                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  aria-label="Next month"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-default bg-surface text-secondary transition hover:bg-surface-muted hover:text-primary"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  icon: Icon,
  accent = "default",
}: {
  label: string;
  value: string | number;
  icon: typeof CalendarDays;
  accent?: "default" | "success" | "danger" | "info";
}) {
  const accentClasses = {
    default:
      "bg-surface-muted text-primary",

    success:
      "bg-success-bg text-success-text",

    danger:
      "bg-danger-bg text-danger-text",

    info:
      "bg-info-bg text-info-text",
  };

  return (
    <div className="min-w-0 rounded-xl border border-default bg-surface p-3">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentClasses[accent]}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      <p className="mt-3 truncate text-lg font-bold tracking-tight text-primary">
        {value}
      </p>

      <p className="mt-0.5 truncate text-[10px] font-medium text-secondary">
        {label}
      </p>
    </div>
  );
}