"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    useAppDispatch,
    useAppSelector,
} from "@/store/hooks";

import {
    resetPassword,
} from "@/features/auth/store/authSlice";

interface ResetPasswordFormProps {
    token: string;
}

export default function ResetPasswordForm({
    token,
}: ResetPasswordFormProps) {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const { loading, error } = useAppSelector(
        (state) => state.auth,
    );

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });

    const [formError, setFormError] = useState<string | null>(
        null,
    );

    const [successMessage, setSuccessMessage] = useState<
        string | null
    >(null);

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setFormError(null);
        setSuccessMessage(null);
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setFormError(null);
        setSuccessMessage(null);

        if (!token) {
            setFormError(
                "Password reset link is invalid or missing.",
            );
            return;
        }

        if (
            !formData.password ||
            !formData.confirmPassword
        ) {
            setFormError("Please complete all fields.");
            return;
        }

        if (
            formData.password !== formData.confirmPassword
        ) {
            setFormError("Passwords do not match.");
            return;
        }

        try {
            await dispatch(
                resetPassword({
                    token,
                    password: formData.password,
                }),
            ).unwrap();

            setSuccessMessage(
                "Your password has been reset successfully.",
            );

            setTimeout(() => {
                router.replace("/login");
            }, 1500);
        } catch {
            // Backend/API error is handled by authSlice.
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5"
        >
            {/* New Password */}
            <div>
                <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-zinc-800"
                >
                    New password
                </label>

                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your new password"
                    disabled={loading}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:cursor-not-allowed disabled:bg-zinc-100"
                />
            </div>

            {/* Confirm Password */}
            <div>
                <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-zinc-800"
                >
                    Confirm new password
                </label>

                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Enter your new password again"
                    disabled={loading}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 disabled:cursor-not-allowed disabled:bg-zinc-100"
                />
            </div>

            {/* Error */}
            {(formError || error) && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {formError || error}
                </div>
            )}

            {/* Success */}
            {successMessage && (
                <div
                    role="status"
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                >
                    {successMessage}
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={loading || !token}
                className="flex w-full items-center justify-center rounded-xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading
                    ? "Resetting password..."
                    : "Reset password"}
            </button>

            {/* Login */}
            <div className="text-center">
                <Link
                    href="/login"
                    className="text-sm font-bold text-zinc-950 transition hover:text-zinc-600"
                >
                    Back to sign in
                </Link>
            </div>
        </form>
    );
}