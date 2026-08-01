"use client";

import {
    FormEvent,
    useState,
} from "react";

import Link from "next/link";

import {
    useAppDispatch,
    useAppSelector,
} from "@/store/hooks";

import {
    forgotPassword,
} from "@/features/auth/store/authSlice";

export default function ForgotPasswordForm() {
    const dispatch = useAppDispatch();

    const {
        loading,
        error,
    } = useAppSelector((state) => state.auth);

    const [email, setEmail] = useState("");

    const [formError, setFormError] = useState<string | null>(
        null,
    );

    const [successMessage, setSuccessMessage] = useState<
        string | null
    >(null);


    /* =========================================================
       PASSWORD RECOVERY
       
       Current backend flow:
       
       Email
         ↓
       POST /api/auth/forgot-password
         ↓
       Backend sends/creates reset instructions
    ========================================================= */

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setFormError(null);
        setSuccessMessage(null);

        const normalizedEmail = email.trim();

        if (!normalizedEmail) {
            setFormError(
                "Please enter your email address.",
            );

            return;
        }

        try {
            await dispatch(
                forgotPassword({
                    email: normalizedEmail,
                }),
            ).unwrap();

            setSuccessMessage(
                "If an account exists for this email, password reset instructions have been sent.",
            );
        } catch {
            /*
             Backend/API error is handled by authSlice.
            */
        }
    };


    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5"
        >
            {/* Email */}

            <div>
                <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-zinc-800"
                >
                    Email address
                </label>

                <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                        setEmail(event.target.value);

                        if (formError) {
                            setFormError(null);
                        }

                        if (successMessage) {
                            setSuccessMessage(null);
                        }
                    }}
                    placeholder="you@example.com"
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
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700"
                >
                    {successMessage}
                </div>
            )}


            {/* Email Recovery */}

            <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-zinc-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading
                    ? "Sending instructions..."
                    : "Send reset instructions"}
            </button>


            {/* Future Passkey Recovery */}

            <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-200" />
                </div>

                <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs text-zinc-400">
                        or
                    </span>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-900">
                    Have a passkey?
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Passkey-based password recovery will let you verify
                    your identity without using a reset message.
                </p>
            </div>


            {/* Back */}

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