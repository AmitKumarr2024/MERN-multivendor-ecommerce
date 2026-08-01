import type { Metadata } from "next";

import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";

export const metadata: Metadata = {
    title: "Reset Password",
    description:
        "Create a new password for your marketplace account.",
};

interface ResetPasswordPageProps {
    searchParams: Promise<{
        token?: string;
    }>;
}

export default async function ResetPasswordPage({
    searchParams,
}: ResetPasswordPageProps) {
    const { token } = await searchParams;

    return (
        <div className="w-full">
            <div className="mb-8">
                <p className="mb-2 text-sm font-semibold text-zinc-500">
                    Account security
                </p>

                <h1 className="text-3xl font-black tracking-tight text-zinc-950">
                    Create a new password
                </h1>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Enter a new password for your account.
                    Make sure it&apos;s secure and different
                    from your previous password.
                </p>
            </div>

            <ResetPasswordForm token={token ?? ""} />
        </div>
    );
}