import RegisterForm from "@/features/auth/components/RegisterForm";
import type { Metadata } from "next";


export const metadata: Metadata = {
    title: "Create Account",
    description:
        "Create your marketplace account to start shopping and selling.",
};

export default function RegisterPage() {
    return (
        <div className="w-full">
            <div className="mb-8">
                <p className="mb-2 text-sm font-semibold text-zinc-500">
                    Get started
                </p>

                <h1 className="text-3xl font-black tracking-tight text-zinc-950">
                    Create your account
                </h1>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Join the marketplace to shop products, manage orders, and access your
                    account.
                </p>
            </div>

            <RegisterForm />
        </div>
    );
}