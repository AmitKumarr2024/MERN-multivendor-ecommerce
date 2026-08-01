import type { Metadata } from "next";

import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = {
    title: "Forgot Password",
    description:
        "Reset the password for your marketplace account.",
};

export default function ForgotPasswordPage() {
    return (
        <div className="w-full">
            <div className="mb-8">
                <p className="mb-2 text-sm font-semibold text-zinc-500">
                    Password recovery
                </p>

                <h1 className="text-3xl font-black tracking-tight text-zinc-950">
                    Forgot your password?
                </h1>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Enter the email address associated with your account and
                    we&apos;ll send you instructions to reset your password.
                </p>
            </div>

            <ForgotPasswordForm />
        </div>
    );
}