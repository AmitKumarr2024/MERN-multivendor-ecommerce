"use client";

import { useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { changePassword } from "@/features/auth/store/authSlice";
import { selectAuthError, selectAuthLoading } from "@/features/auth/store/authSelector";
import SectionCard from "./sectioncard";

const LockIcon = (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path d="M5 8V6a5 5 0 0 1 10 0v2h.5A1.5 1.5 0 0 1 17 9.5v7A1.5 1.5 0 0 1 15.5 18h-11A1.5 1.5 0 0 1 3 16.5v-7A1.5 1.5 0 0 1 4.5 8H5Zm2 0h6V6a3 3 0 0 0-6 0v2Z" />
    </svg>
);

export default function ChangePasswordForm() {
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectAuthLoading);
    const error = useAppSelector(selectAuthError);

    const [open, setOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (newPassword !== confirmPassword) {
            setLocalError("New password and confirmation don't match.");
            return;
        }

        const result = await dispatch(changePassword({ currentPassword, newPassword }));

        if (changePassword.fulfilled.match(result)) {
            setDone(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }
    };

    return (
        <SectionCard
            title="Password"
            description="Keep your account secure with a strong password."
            icon={LockIcon}
            action={
                <button
                    type="button"
                    onClick={() => {
                        setOpen((v) => !v);
                        setDone(false);
                        setLocalError(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 sm:text-sm"
                >
                    {open ? "Close" : "Change"}
                </button>
            }
        >
            {!open && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="tracking-widest">••••••••••</span>
                </div>
            )}

            {open && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {(error || localError) && (
                        <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
                            <svg
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="mt-0.5 h-4 w-4 shrink-0"
                            >
                                <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm.75 4.5v5h-1.5v-5h1.5Zm0 6.5v1.5h-1.5V13h1.5Z" />
                            </svg>
                            <span>{localError || error}</span>
                        </div>
                    )}

                    {done && (
                        <div className="flex items-start gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-700">
                            <svg
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="mt-0.5 h-4 w-4 shrink-0"
                            >
                                <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm3.7 5.7-4.5 4.5-2.9-2.9 1.06-1.06L9.2 9.14l3.44-3.44 1.06 1Z" />
                            </svg>
                            <span>Password changed successfully.</span>
                        </div>
                    )}

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-700 sm:text-sm">
                            Current password
                        </label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700 sm:text-sm">
                                New password
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={8}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700 sm:text-sm">
                                Confirm password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={8}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800 disabled:opacity-50 sm:w-auto"
                    >
                        {loading ? "Updating..." : "Update password"}
                    </button>
                </form>
            )}
        </SectionCard>
    );
}