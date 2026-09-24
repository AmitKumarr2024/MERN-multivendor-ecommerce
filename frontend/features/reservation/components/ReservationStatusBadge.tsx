"use client";
import { Clock3, CheckCircle2, PackageCheck, XCircle, Timer, CircleDot } from "lucide-react";
import type { ReservationStatus } from "../types/reservation.types";

const CONFIG: Record<ReservationStatus, { label: string; className: string; icon: React.ElementType }> = {
    pending: { label: "Pending", className: "bg-warning-bg text-warning-text", icon: Clock3 },
    confirmed: { label: "Confirmed", className: "bg-info-bg text-info-text", icon: CheckCircle2 },
    ready: { label: "Ready for Pickup", className: "bg-success-bg text-success-text", icon: PackageCheck },
    collected: { label: "Collected", className: "bg-surface-muted text-secondary", icon: CircleDot },
    cancelled: { label: "Cancelled", className: "bg-danger-bg text-danger-text", icon: XCircle },
    expired: { label: "Expired", className: "bg-danger-bg text-danger-text", icon: Timer },
};

export default function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
    const { label, className, icon: Icon } = CONFIG[status];
    return (
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`}>
            <Icon className="h-3 w-3" />
            {label}
        </span>
    );
}