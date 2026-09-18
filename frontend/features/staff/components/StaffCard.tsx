import type { Staff } from "../types/staff.types";
import { RatingStars } from "@/features/reviews";

interface StaffCardProps {
  staff: Staff;
  onClick?: () => void;
}

export default function StaffCard({
  staff,
  onClick,
}: StaffCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-muted focus:outline-none focus-visible:bg-surface-muted"
    >
      {/* =========================================================
                AVATAR
               ========================================================= */}
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-muted">
        {staff.profilePhoto.url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={staff.profilePhoto.url}
            alt={staff.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-accent/10 text-sm font-bold text-accent">
            {staff.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* =========================================================
                STAFF INFO
               ========================================================= */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-primary">
          {staff.name}
        </p>

        <p className="mt-0.5 truncate text-xs text-secondary">
          {staff.role}
        </p>

        <div className="mt-1 flex min-w-0 items-center gap-1.5">
          <RatingStars
            value={staff.ratingAverage}
            readOnly
            size="sm"
          />

          <span className="shrink-0 text-[10px] text-muted">
            ({staff.feedbackCount})
          </span>
        </div>
      </div>

      {/* =========================================================
                ACTION INDICATOR
               ========================================================= */}
      <span
        aria-hidden="true"
        className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
      >
        ›
      </span>
    </button>
  );
}