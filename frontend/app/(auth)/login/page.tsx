import type { Metadata } from "next";

import LoginForm from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
    title: "Sign In",
    description:
        "Sign in to your marketplace account to manage orders, shopping, and selling.",
};

export default function LoginPage() {
    return (
        <div className="w-full">
            <div className="mb-8">
                <p className="mb-2 text-sm font-semibold text-zinc-500">
                    Welcome back
                </p>

                <h1 className="text-3xl font-black tracking-tight text-zinc-950">
                    Sign in to your account
                </h1>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Enter your account details to continue to the marketplace.
                </p>
            </div>

            <LoginForm />
        </div>
    );
}