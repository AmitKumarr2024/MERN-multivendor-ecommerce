"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateMe, clearAuthError } from "@/features/auth/store/authSlice";
import {
    selectAuthError,
    selectAuthLoading,
    selectCurrentUser,
} from "@/features/auth/store/authSelector";
import SectionCard from "./sectioncard";
import { ImageUploadField } from "@/features/upload";

const UserIcon = (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path d="M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.31 0-8 1.66-8 5v1h16v-1c0-3.34-4.69-5-8-5Z" />
    </svg>
);

const inputClass =
    "w-full rounded-xl border border-default bg-surface px-3.5 py-2.5 text-sm text-primary shadow-sm transition-all placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";
const labelClass = "mb-1.5 block text-xs font-medium text-secondary sm:text-sm";

interface AddressForm {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

const emptyAddress: AddressForm = {
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
};

export default function ProfileInfoForm() {
    const dispatch = useAppDispatch();

    const user = useAppSelector(selectCurrentUser);
    const loading = useAppSelector(selectAuthLoading);
    const error = useAppSelector(selectAuthError);

    const [name, setName] = useState(user?.name ?? "");
    const [phone, setPhone] = useState(user?.phone ?? "");
    const [avatar, setAvatar] = useState(user?.avatar ?? "");
    const [address, setAddress] = useState<AddressForm>({
        ...emptyAddress,
        ...(user?.address ?? {}),
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setName(user?.name ?? "");
        setPhone(user?.phone ?? "");
        setAvatar(user?.avatar ?? "");
        setAddress({ ...emptyAddress, ...(user?.address ?? {}) });
    }, [user]);

    useEffect(() => {
        return () => {
            dispatch(clearAuthError());
        };
    }, [dispatch]);

    if (!user) return null;

    const updateAddress = (key: keyof AddressForm, value: string) => {
        setAddress((a) => ({ ...a, [key]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Name can't be empty.");
            return;
        }

        const result = await dispatch(
            updateMe({
                name: name.trim(),
                phone: phone.trim() || undefined,
                avatar: avatar || undefined,
                address,
            }),
        );

        if (updateMe.fulfilled.match(result)) {
            toast.success("Profile updated successfully.");
            setIsEditing(false);
        } else {
            toast.error((result.payload as string) || "Couldn't update profile. Try again.");
        }
    };

    const handleCancel = () => {
        setName(user.name ?? "");
        setPhone(user.phone ?? "");
        setAvatar(user.avatar ?? "");
        setAddress({ ...emptyAddress, ...(user.address ?? {}) });
        setIsEditing(false);
        dispatch(clearAuthError());
    };

    const hasAddress = Boolean(
        user.address?.street || user.address?.city || user.address?.pincode,
    );

    return (
        <SectionCard
            title="Account info"
            description="Your name, contact, and delivery address."
            icon={UserIcon}
            action={
                !isEditing && (
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-default px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:border-strong hover:bg-surface-hover sm:text-sm"
                    >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                            <path d="M13.59 3.6a2 2 0 0 1 2.83 2.83l-8.9 8.9-3.66.83.83-3.66 8.9-8.9Z" />
                        </svg>
                        Edit
                    </button>
                )
            }
        >
            {error && !isEditing ? (
                <div className="mb-4 flex items-start gap-2 rounded-lg bg-danger-bg px-3 py-2.5 text-sm text-danger-text">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0">
                        <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm.75 4.5v5h-1.5v-5h1.5Zm0 6.5v1.5h-1.5V13h1.5Z" />
                    </svg>
                    <span>{error}</span>
                </div>
            ) : null}

            {isEditing ? (
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Avatar + name/phone */}
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                        <div className="shrink-0 self-center sm:self-start">
                            <ImageUploadField
                                label="Profile photo"
                                value={avatar}
                                onChange={(url) => setAvatar(url)}
                                folder="avatar"
                                shape="circle"
                            />
                        </div>

                        <div className="grid flex-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Full name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Phone</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Not set"
                                    className={inputClass}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Email</label>
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="w-full cursor-not-allowed rounded-xl border border-default bg-surface-muted px-3.5 py-2.5 text-sm text-secondary"
                                />
                                <p className="mt-1.5 text-xs text-muted">
                                    Email can&apos;t be changed here.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <fieldset className="rounded-xl border border-default p-4">
                        <legend className="px-1 text-xs font-medium text-secondary sm:text-sm">
                            Delivery address
                        </legend>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Street</label>
                                <input
                                    type="text"
                                    value={address.street}
                                    onChange={(e) => updateAddress("street", e.target.value)}
                                    placeholder="House no, street, area"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>City</label>
                                <input
                                    type="text"
                                    value={address.city}
                                    onChange={(e) => updateAddress("city", e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>State</label>
                                <input
                                    type="text"
                                    value={address.state}
                                    onChange={(e) => updateAddress("state", e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Pincode</label>
                                <input
                                    type="text"
                                    value={address.pincode}
                                    onChange={(e) => updateAddress("pincode", e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Country</label>
                                <input
                                    type="text"
                                    value={address.country}
                                    onChange={(e) => updateAddress("country", e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </fieldset>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            className="rounded-xl border border-strong px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface-hover disabled:opacity-50 sm:flex-none"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50 sm:flex-none"
                        >
                            {loading ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-5">
                    <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-default bg-surface-muted">
                            {user.avatar ? (
                                <Image src={user.avatar} alt={user.name} fill sizes="64px" className="object-cover" />
                            ) : (
                                <div className="flex h-full items-center justify-center text-lg font-semibold text-muted">
                                    {(user.name || user.email || "?").charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-primary">{user.name || "—"}</p>
                            <p className="truncate text-xs text-secondary">{user.email}</p>
                        </div>
                    </div>

                    <dl className="divide-y divide-default">
                        <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
                            <dt className="text-secondary">Phone</dt>
                            <dd className="truncate font-medium text-primary">{user.phone || "—"}</dd>
                        </div>
                        <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
                            <dt className="shrink-0 text-secondary">Address</dt>
                            <dd className="truncate text-right font-medium text-primary">
                                {hasAddress
                                    ? [user.address?.street, user.address?.city, user.address?.state, user.address?.pincode]
                                        .filter(Boolean)
                                        .join(", ")
                                    : "Not added yet"}
                            </dd>
                        </div>
                    </dl>
                </div>
            )}
        </SectionCard>
    );
}