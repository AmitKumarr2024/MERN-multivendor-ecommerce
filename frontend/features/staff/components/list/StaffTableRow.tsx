"use client";

import { useState } from "react";
import { BriefcaseBusiness, CalendarDays, Clock3, Edit3, Star, UserRound } from "lucide-react";

import type { Staff } from "../../types/staff.types";
import StaffActionsMenu from "./StaffActionsMenu";
import StaffAttendanceCalendar from "../StaffAttendanceCalendar";
import StaffForm from "../StaffForm";
import Modal from "../../ui/Modal";

interface StaffTableRowProps {
    member: Staff;
    shopId: string;
    onToggleStatus: () => void;
    onRemove: () => void;
    onRefetch: () => void;
}

export default function StaffTableRow({ member, shopId, onToggleStatus, onRemove, onRefetch }: StaffTableRowProps) {
    const [modal, setModal] = useState<"attendance" | "edit" | null>(null);
    const profilePhotoUrl = member.profilePhoto?.url ?? null;
    const rating = Number(member.ratingAverage ?? 0);

    const actions = (
        <StaffActionsMenu
            isActive={member.isActive}
            onOpenAttendance={() => setModal("attendance")}
            onOpenEdit={() => setModal("edit")}
            onToggleStatus={onToggleStatus}
            onRemove={onRemove}
        />
    );

    return (
        <>
            {/* Desktop row */}
            <tr className="hidden border-b border-default/70 transition-colors last:border-0 hover:bg-surface-muted/40 md:table-row">
                <td className="px-5 py-4">
                    <div className="flex min-w-[220px] items-center gap-3.5">
                        <StaffAvatar name={member.name} imageUrl={profilePhotoUrl} />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-primary">{member.name}</p>
                            <p className="mt-0.5 text-xs text-muted">Staff member</p>
                        </div>
                    </div>
                </td>
                <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                        <BriefcaseBusiness className="h-3.5 w-3.5 text-muted" />
                        <span className="text-sm text-secondary">{member.role || "—"}</span>
                    </div>
                </td>
                <td className="px-5 py-4">
                    <StatusBadge isActive={member.isActive} />
                </td>
                <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-current text-amber-500" />
                        <span className="text-sm font-semibold text-primary">{rating.toFixed(1)}</span>
                        <span className="text-xs text-muted">({member.feedbackCount ?? 0})</span>
                    </div>
                </td>
                <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                        <Clock3 className="h-3.5 w-3.5 text-muted" />
                        <span className="text-sm text-secondary">{member.experience || "—"}</span>
                    </div>
                </td>
                <td className="px-5 py-4 text-right">
                    <div className="flex justify-end">{actions}</div>
                </td>
            </tr>

            {/* Mobile card */}
            <div className="border-b border-default/70 bg-surface p-4 md:hidden">
                <div className="rounded-2xl border border-default/80 bg-surface shadow-sm">
                    <div className="flex items-start justify-between gap-3 p-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <StaffAvatar name={member.name} imageUrl={profilePhotoUrl} />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-primary">{member.name}</p>
                                <p className="mt-1 text-xs text-secondary">{member.role || "Staff member"}</p>
                            </div>
                        </div>
                        <div className="shrink-0">{actions}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-default/70 p-3">
                        <InfoItem label="Status" value={<StatusBadge isActive={member.isActive} />} />
                        <InfoItem
                            label="Rating"
                            value={
                                <div className="flex items-center gap-1">
                                    <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                                    <span className="text-sm font-semibold text-primary">{rating.toFixed(1)}</span>
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>

            {modal === "attendance" && (
                <Modal title="Attendance" subtitle={member.name} icon={<CalendarDays className="h-4.5 w-4.5" />} onClose={() => setModal(null)} maxWidth="lg">
                    <div className="p-5">
                        <StaffAttendanceCalendar staffId={member._id} />
                    </div>
                </Modal>
            )}

            {modal === "edit" && (
                <Modal title="Edit staff member" subtitle={member.name} icon={<Edit3 className="h-4.5 w-4.5" />} onClose={() => setModal(null)}>
                    <StaffForm
                        shopId={shopId}
                        existing={member}
                        onDone={() => {
                            setModal(null);
                            onRefetch();
                        }}
                    />
                </Modal>
            )}
        </>
    );
}

function StaffAvatar({ name, imageUrl }: { name: string; imageUrl: string | null }) {
    return (
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-default bg-surface-muted shadow-sm">
            {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
                <UserRound className="h-5 w-5 text-muted" />
            )}
        </div>
    );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${isActive ? "border-success/20 bg-success-bg text-success-text" : "border-default bg-surface-muted text-secondary"
                }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-success-text" : "bg-muted"}`} />
            {isActive ? "Active" : "Inactive"}
        </span>
    );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="rounded-xl bg-surface-muted/50 px-3 py-2.5">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</p>
            {value}
        </div>
    );
}