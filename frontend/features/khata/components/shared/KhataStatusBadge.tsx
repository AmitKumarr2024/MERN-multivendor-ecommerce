"use client";

import { CheckCircle2, Clock3, XCircle, PauseCircle } from "lucide-react";
import type { KhataStatus } from "../../types/khata.types";

const STATUS_CONFIG: Record<
  KhataStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pending",
    className: "bg-warning-bg text-warning-text",
    icon: Clock3,
  },
  approved: {
    label: "Approved",
    className: "bg-success-bg text-success-text",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    className: "bg-danger-bg text-danger-text",
    icon: XCircle,
  },
  suspended: {
    label: "Suspended",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    icon: PauseCircle,
  },
};

export default function KhataStatusBadge({ status }: { status: KhataStatus }) {
  const { label, className, icon: Icon } = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}