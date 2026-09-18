"use client";

import { useState } from "react";
import {
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    LockKeyhole,
    ShieldCheck,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { changePassword } from "@/features/auth/store/authSlice";
import {
    selectAuthError,
    selectAuthLoading,
} from "@/features/auth/store/authSelector";

const inputClass = `
    w-full
    rounded-xl
    border
    border-default
    bg-surface
    px-3.5
    py-2.5
    text-sm
    text-primary
    outline-none
    transition-all
    placeholder:text-muted
    focus:border-accent
    focus:ring-2
    focus:ring-accent/15
`;

export default function ChangePasswordForm() {
    const dispatch = useAppDispatch();

    const loading = useAppSelector(
        selectAuthLoading,
    );

    const error = useAppSelector(
        selectAuthError,
    );

    const [open, setOpen] = useState(false);

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [localError, setLocalError] =
        useState<string | null>(null);

    const [done, setDone] =
        useState(false);

    const handleSubmit = async (
        e: React.FormEvent,
    ) => {
        e.preventDefault();

        setLocalError(null);
        setDone(false);

        if (
            newPassword !==
            confirmPassword
        ) {
            setLocalError(
                "New password and confirmation don't match.",
            );
            return;
        }

        const result = await dispatch(
            changePassword({
                currentPassword,
                newPassword,
            }),
        );

        if (
            changePassword.fulfilled.match(
                result,
            )
        ) {
            setDone(true);

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }
    };

    const handleToggle = () => {
        setOpen((value) => !value);
        setDone(false);
        setLocalError(null);
    };

    return (
        <div className="p-5 sm:p-6">
            {/* Header */}
            <button
                type="button"
                onClick={handleToggle}
                className="
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-4
                    text-left
                "
            >
                <div className="flex min-w-0 items-center gap-3">
                    <div
                        className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-surface-muted
                            text-secondary
                        "
                    >
                        <LockKeyhole className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                        <h3 className="text-sm font-bold text-primary">
                            Password
                        </h3>

                        <p className="mt-0.5 text-xs text-muted">
                            Update your account password
                        </p>
                    </div>
                </div>

                <ChevronDown
                    className={`
                        h-4 w-4
                        shrink-0
                        text-muted
                        transition-transform
                        duration-200
                        ${open ? "rotate-180" : ""}
                    `}
                />
            </button>

            {/* Collapsed */}
            {!open && (
                <div className="mt-4 flex items-center gap-2 text-xs text-muted">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />

                    <span>
                        Password protected
                    </span>
                </div>
            )}

            {/* Form */}
            {open && (
                <form
                    onSubmit={handleSubmit}
                    className="mt-5 space-y-5"
                >
                    {(error || localError) && (
                        <div className="flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                            <span>
                                {localError ||
                                    error}
                            </span>
                        </div>
                    )}

                    {done && (
                        <div className="flex items-start gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

                            <span>
                                Password changed successfully.
                            </span>
                        </div>
                    )}

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-secondary">
                            Current password
                        </label>

                        <input
                            type="password"
                            value={
                                currentPassword
                            }
                            onChange={(e) =>
                                setCurrentPassword(
                                    e.target.value,
                                )
                            }
                            required
                            className={
                                inputClass
                            }
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-secondary">
                                New password
                            </label>

                            <input
                                type="password"
                                value={
                                    newPassword
                                }
                                onChange={(e) =>
                                    setNewPassword(
                                        e.target.value,
                                    )
                                }
                                required
                                minLength={8}
                                className={
                                    inputClass
                                }
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-secondary">
                                Confirm password
                            </label>

                            <input
                                type="password"
                                value={
                                    confirmPassword
                                }
                                onChange={(e) =>
                                    setConfirmPassword(
                                        e.target.value,
                                    )
                                }
                                required
                                minLength={8}
                                className={
                                    inputClass
                                }
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="
                                rounded-xl
                                bg-accent
                                px-5
                                py-2.5
                                text-sm
                                font-semibold
                                text-accent-foreground
                                transition-all
                                hover:-translate-y-0.5
                                hover:opacity-90
                                disabled:opacity-50
                            "
                        >
                            {loading
                                ? "Updating..."
                                : "Update password"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}