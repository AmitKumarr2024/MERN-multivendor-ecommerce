"use client";

import { useEffect, useState } from "react";
import {
    BriefcaseBusiness,
    CalendarDays,
    Camera,
    FileText,
    UserRound,
    X,
} from "lucide-react";

import { useAppDispatch } from "@/store/hooks";

import {
    createStaffMember,
    updateStaffMember,
} from "../store/staffSlice";

import type { Staff } from "../types/staff.types";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";

interface StaffFormProps {
    shopId: string;
    existing?: Staff | null;
    onDone?: () => void;
}

export default function StaffForm({
    shopId,
    existing,
    onDone,
}: StaffFormProps) {
    const dispatch = useAppDispatch();

    const [name, setName] = useState(existing?.name ?? "");

    const [role, setRole] = useState(existing?.role ?? "");

    const [bio, setBio] = useState(existing?.bio ?? "");

    const [joiningDate, setJoiningDate] = useState(
        existing?.joiningDate
            ? existing.joiningDate.slice(0, 10)
            : ""
    );

    const [photo, setPhoto] = useState<File | undefined>();

    const [photoPreview, setPhotoPreview] = useState<string | null>(
        existing?.profilePhoto?.url ?? null
    );

    const [submitting, setSubmitting] = useState(false);

    /*
     * Cleanup object URLs created for previews.
     */
    useEffect(() => {
        return () => {
            if (photoPreview?.startsWith("blob:")) {
                URL.revokeObjectURL(photoPreview);
            }
        };
    }, [photoPreview]);

    /*
     * Photo change
     */
    const handlePhotoChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        /*
         * Basic client-side validation.
         */
        if (!file.type.startsWith("image/")) {
            e.target.value = "";
            return;
        }

        /*
         * Remove old preview URL.
         */
        if (photoPreview?.startsWith("blob:")) {
            URL.revokeObjectURL(photoPreview);
        }

        setPhoto(file);

        const previewUrl = URL.createObjectURL(file);

        setPhotoPreview(previewUrl);
    };

    /*
     * Submit
     */
    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (submitting) {
            return;
        }

        setSubmitting(true);

        try {
            if (existing) {
                await dispatch(
                    updateStaffMember({
                        staffId: existing._id,

                        payload: {
                            name,
                            role,
                            bio,
                            joiningDate,
                            profilePhoto: photo,
                        },
                    })
                ).unwrap();
            } else {
                await dispatch(
                    createStaffMember({
                        shopId,

                        payload: {
                            name,
                            role,
                            bio,
                            joiningDate,
                            profilePhoto: photo,
                        },
                    })
                ).unwrap();
            }

            onDone?.();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full overflow-hidden bg-surface shadow-sm"
        >
          
            {/* =====================================================
                FORM BODY
            ===================================================== */}

            <div className="space-y-6 p-4 sm:p-5">

                {/* =================================================
                    PROFILE PHOTO
                ================================================= */}

                <section>
                    <div className="mb-3">
                        <div className="flex items-center gap-2">
                            <Camera className="h-4 w-4 text-muted" />

                            <h3 className="text-sm font-semibold text-primary">
                                Profile photo
                            </h3>
                        </div>

                        <p className="mt-1 text-[11px] leading-4 text-secondary">
                            Add a clear photo so buyers can recognize
                            your team member.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        {/* Preview */}

                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-default bg-surface-muted">
                            {photoPreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={photoPreview}
                                    alt="Staff profile preview"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted">
                                    <UserRound className="h-7 w-7" />
                                </div>
                            )}
                        </div>

                        {/* Upload */}

                        <div className="min-w-0 flex-1">
                            <label
                                htmlFor="staff-profile-photo"
                                className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-default bg-surface-muted/30 px-3 py-2.5 text-xs font-semibold text-secondary transition hover:bg-surface-muted hover:text-primary"
                            >
                                <Camera className="h-4 w-4 shrink-0" />

                                <span className="truncate">
                                    {photo
                                        ? "Change photo"
                                        : "Choose profile photo"}
                                </span>
                            </label>

                            <Input
                                id="staff-profile-photo"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handlePhotoChange}
                                className="sr-only"
                            />

                            <p className="mt-1.5 text-[10px] text-muted">
                                JPG, PNG or WebP recommended.
                            </p>
                        </div>
                    </div>
                </section>

                {/* =================================================
                    BASIC INFORMATION
                ================================================= */}

                <section className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-default pb-2.5">
                        <UserRound className="h-4 w-4 text-muted" />

                        <h3 className="text-sm font-semibold text-primary">
                            Basic information
                        </h3>
                    </div>

                    {/* Name */}

                    <div>
                        <label
                            htmlFor="staff-name"
                            className="mb-1.5 block text-xs font-semibold text-primary"
                        >
                            Name
                        </label>

                        <Input
                            id="staff-name"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            placeholder="e.g. Rahul Sharma"
                            required
                        />
                    </div>

                    {/* Role */}

                    <div>
                        <label
                            htmlFor="staff-role"
                            className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-primary"
                        >
                            <BriefcaseBusiness className="h-3.5 w-3.5 text-muted" />

                            Role / Designation
                        </label>

                        <Input
                            id="staff-role"
                            value={role}
                            onChange={(e) =>
                                setRole(e.target.value)
                            }
                            placeholder="e.g. Head Tailor"
                            required
                        />
                    </div>

                    {/* Bio */}

                    <div>
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                            <label
                                htmlFor="staff-bio"
                                className="flex items-center gap-1.5 text-xs font-semibold text-primary"
                            >
                                <FileText className="h-3.5 w-3.5 text-muted" />

                                Short bio
                            </label>

                            <span className="shrink-0 text-[10px] text-muted">
                                {bio.length}/500
                            </span>
                        </div>

                        <Textarea
                            id="staff-bio"
                            value={bio}
                            onChange={(e) =>
                                setBio(e.target.value)
                            }
                            maxLength={500}
                            rows={3}
                            placeholder="Tell buyers a little about this team member..."
                        />
                    </div>

                    {/* Joining date */}

                    <div>
                        <label
                            htmlFor="staff-joining-date"
                            className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-primary"
                        >
                            <CalendarDays className="h-3.5 w-3.5 text-muted" />

                            Joining date
                        </label>

                        <Input
                            id="staff-joining-date"
                            type="date"
                            value={joiningDate}
                            onChange={(e) =>
                                setJoiningDate(e.target.value)
                            }
                            required
                        />
                    </div>
                </section>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="border-t border-default pt-4">
                    <div className="flex flex-wrap flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[10px] leading-4 text-secondary">
                            Staff information may be visible
                            to buyers on your shop page.
                        </p>

                        <Button
                            type="submit"
                            disabled={submitting}
                            loading={submitting}
                            className="w-full"
                        >
                            {existing
                                ? "Save changes"
                                : "Add staff member"}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}