"use client";

import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateMe, clearAuthError, clearAuthMessage } from "@/features/auth/store/authSlice";
import {
    selectAuthError,
    selectAuthLoading,
    selectAuthSuccessMessage,
    selectCurrentUser,
} from "@/features/auth/store/authSelector";
import SectionCard from "./sectioncard";

const UserIcon = (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path d="M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.31 0-8 1.66-8 5v1h16v-1c0-3.34-4.69-5-8-5Z" />
    </svg>
);

export default function ProfileInfoForm() {
    const dispatch = useAppDispatch();

    const user = useAppSelector(selectCurrentUser);
    const loading = useAppSelector(selectAuthLoading);
    const error = useAppSelector(selectAuthError);
    const successMessage = useAppSelector(selectAuthSuccessMessage);

    const [name, setName] = useState(user?.name ?? "");
    const [phone, setPhone] = useState(user?.phone ?? "");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setName(user?.name ?? "");
        setPhone(user?.phone ?? "");
    }, [user?.name, user?.phone]);

    useEffect(() => {
        return () => {
            dispatch(clearAuthError());
            dispatch(clearAuthMessage());
        };
    }, [dispatch]);

    if (!user) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = await dispatch(
            updateMe({ name: name.trim(), phone: phone.trim() || undefined }),
        );

        if (updateMe.fulfilled.match(result)) {
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setName(user.name ?? "");
        setPhone(user.phone ?? "");
        setIsEditing(false);
        dispatch(clearAuthError());
    };

    return (
        <SectionCard
            title="Account info"
            description="Your name and contact details."
            icon={UserIcon}
            action={
                !isEditing && (
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 sm:text-sm"
                    >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                            <path d="M13.59 3.6a2 2 0 0 1 2.83 2.83l-8.9 8.9-3.66.83.83-3.66 8.9-8.9Z" />
                        </svg>
                        Edit
                    </button>
                )
            }
        >
            {error ? (
                <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0">
                        <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm.75 4.5v5h-1.5v-5h1.5Zm0 6.5v1.5h-1.5V13h1.5Z" />
                    </svg>
                    <span>{error}</span>
                </div>
            ) : null}

            {successMessage ? (
                <div className="mb-4 flex items-start gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-700">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0">
                        <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm3.7 5.7-4.5 4.5-2.9-2.9 1.06-1.06L9.2 9.14l3.44-3.44 1.06 1Z" />
                    </svg>
                    <span>{successMessage}</span>
                </div>
            ) : null}

            {isEditing ? (
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 sm:text-sm">
                            Full name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 sm:text-sm">
                            Phone
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Not set"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 shadow-sm transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 sm:text-sm">
                            Email
                        </label>
                        <input
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
                        />
                        <p className="mt-1.5 text-xs text-gray-400">
                            Email can&apos;t be changed here.
                        </p>
                    </div>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 sm:flex-none"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800 disabled:opacity-50 sm:flex-none"
                        >
                            {loading ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </form>
            ) : (
                <dl className="divide-y divide-gray-100">
                    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
                        <dt className="text-gray-500">Name</dt>
                        <dd className="truncate font-medium text-gray-900">
                            {user.name || "—"}
                        </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
                        <dt className="text-gray-500">Email</dt>
                        <dd className="truncate font-medium text-gray-900">{user.email}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
                        <dt className="text-gray-500">Phone</dt>
                        <dd className="truncate font-medium text-gray-900">
                            {user.phone || "—"}
                        </dd>
                    </div>
                </dl>
            )}
        </SectionCard>
    );
}