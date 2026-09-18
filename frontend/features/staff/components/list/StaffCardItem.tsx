"use client";

import { useState } from "react";

import {
    CalendarDays,
    Edit3,
    Power,
    Trash2,
    UserRound,
} from "lucide-react";

import type { Staff } from "../../types/staff.types";

import StaffAttendanceCalendar from "../StaffAttendanceCalendar";
import StaffForm from "../StaffForm";

import Modal from "../../ui/Modal";

interface StaffCardItemProps {
    member: Staff;
    shopId: string;
    onToggleStatus: () => void;
    onRemove: (reason: string) => void;
    onRefetch: () => void;
}

export default function StaffCardItem({
    member,
    shopId,
    onToggleStatus,
    onRemove,
    onRefetch,
}: StaffCardItemProps) {
    const [modal, setModal] = useState<
        "attendance" | "edit" | "remove" | null
    >(null);

    const [removeReason, setRemoveReason] = useState("");

    const profilePhotoUrl = member.profilePhoto?.url ?? null;

    const closeRemoveModal = () => {
        setModal(null);
        setRemoveReason("");
    };

    const handleRemoveConfirm = () => {
        const reason = removeReason.trim();

        if (!reason) {
            return;
        }

        onRemove(reason);
        closeRemoveModal();
    };

    return (
        <>
            <div className="overflow-hidden rounded-2xl border border-default bg-surface shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <div className="p-5">
                    <div className="flex items-start gap-4">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-default bg-surface-muted">
                            {profilePhotoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={profilePhotoUrl}
                                    alt={member.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-primary">
                                    <UserRound className="h-6 w-6" />
                                </div>
                            )}

                            <span
                                className={`absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-surface ${member.isActive
                                    ? "bg-success-text"
                                    : "bg-muted"
                                    }`}
                            />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <h3 className="truncate text-base font-bold text-primary">
                                        {member.name}
                                    </h3>

                                    <p className="mt-0.5 truncate text-sm text-secondary">
                                        {member.role}
                                    </p>
                                </div>

                                <span
                                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${member.isActive
                                        ? "bg-success-bg text-success-text"
                                        : "bg-surface-muted text-secondary"
                                        }`}
                                >
                                    {member.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {member.bio && (
                        <p className="mt-4 line-clamp-2 text-xs leading-5 text-secondary">
                            {member.bio}
                        </p>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-surface-muted/50 px-3 py-2.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                                Rating
                            </p>

                            <p className="mt-0.5 text-sm font-bold text-primary">
                                {Number(member.ratingAverage ?? 0).toFixed(1)}

                                <span className="ml-1 text-xs font-normal text-muted">
                                    ({member.feedbackCount ?? 0})
                                </span>
                            </p>
                        </div>

                        <div className="rounded-xl bg-surface-muted/50 px-3 py-2.5">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                                Experience
                            </p>

                            <p className="mt-0.5 truncate text-sm font-bold text-primary">
                                {member.experience || "—"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-4 border-t border-default bg-surface-muted/20">
                    <IconAction
                        icon={<CalendarDays className="h-6 w-6" />}
                        label="Attendance"
                        onClick={() => setModal("attendance")}
                    />

                    <IconAction
                        icon={<Edit3 className="h-6 w-6" />}
                        label="Edit"
                        onClick={() => setModal("edit")}
                    />

                    <IconAction
                        icon={<Power className="h-6 w-6" />}
                        label={member.isActive ? "Disable" : "Enable"}
                        onClick={onToggleStatus}
                    />

                    <IconAction
                        icon={<Trash2 className="h-6 w-6" />}
                        label="Remove"
                        danger
                        onClick={() => setModal("remove")}
                    />
                </div>
            </div>

            {/* Attendance */}
            {modal === "attendance" && (
                <Modal
                    title="Attendance"
                    subtitle={member.name}
                    icon={<CalendarDays className="h-4.5 w-4.5" />}
                    onClose={() => setModal(null)}
                    maxWidth="lg"
                >
                    <div className="p-5">
                        <StaffAttendanceCalendar staffId={member._id} />
                    </div>
                </Modal>
            )}

            {/* Edit */}
            {modal === "edit" && (
                <Modal
                    title="Edit staff member"
                    subtitle={member.name}
                    icon={<Edit3 className="h-4.5 w-4.5" />}
                    onClose={() => setModal(null)}
                >
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

            {/* Remove confirmation */}
            {modal === "remove" && (
                <Modal
                    title="Remove staff member"
                    subtitle={member.name}
                    icon={<Trash2 className="h-4.5 w-4.5" />}
                    onClose={closeRemoveModal}
                >
                    <div className="space-y-5 p-5">
                        <div className="rounded-xl border border-danger-border bg-danger-bg/50 p-4">
                            <p className="text-sm font-semibold text-danger-text">
                                Are you sure you want to remove {member.name}?
                            </p>

                            <p className="mt-1.5 text-xs leading-5 text-secondary">
                                This will remove this staff member from your
                                store. Please provide a reason before
                                continuing.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor={`remove-reason-${member._id}`}
                                className="mb-2 block text-sm font-semibold text-primary"
                            >
                                Reason for removal
                                <span className="ml-1 text-danger-text">
                                    *
                                </span>
                            </label>

                            <textarea
                                id={`remove-reason-${member._id}`}
                                value={removeReason}
                                onChange={(event) =>
                                    setRemoveReason(event.target.value)
                                }
                                placeholder="Explain why you are removing this staff member..."
                                rows={4}
                                maxLength={500}
                                className="w-full resize-none rounded-xl border border-default bg-surface px-3.5 py-3 text-sm text-primary outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />

                            <div className="mt-1 flex justify-end">
                                <span className="text-[11px] text-muted">
                                    {removeReason.length}/500
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={closeRemoveModal}
                                className="rounded-xl border border-default px-4 py-2.5 text-sm font-semibold text-secondary transition hover:bg-surface-muted hover:text-primary"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleRemoveConfirm}
                                disabled={!removeReason.trim()}
                                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
                            >
                                Remove Staff
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}

function IconAction({
    icon,
    label,
    onClick,
    danger = false,
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    danger?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            className={`flex min-w-0 w-full flex-col items-center justify-center gap-1.5 overflow-hidden border-r border-default px-1.5 py-3.5 text-center text-[10px] font-semibold leading-tight transition last:border-r-0 sm:py-3 ${danger
                ? "text-danger-text hover:bg-danger-bg"
                : "text-secondary hover:bg-surface-muted hover:text-primary"
                }`}
        >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                {icon}
            </span>

            {/* <span className="block w-full min-w-0 truncate whitespace-nowrap">
                {label}
            </span> */}
        </button>
    );
}