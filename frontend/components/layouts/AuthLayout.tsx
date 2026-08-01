import Link from "next/link";

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({
    children,
}: AuthLayoutProps) {
    return (
        <main className="min-h-screen bg-zinc-50">
            <div className="grid min-h-screen lg:grid-cols-2">
                {/* Left Side - Brand / Marketplace Information */}
                <section className="relative hidden overflow-hidden bg-zinc-950 lg:flex lg:flex-col lg:justify-between">
                    {/* Background Decoration */}
                    <div
                        className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl"
                        aria-hidden="true"
                    />

                    <div
                        className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-white/5 blur-3xl"
                        aria-hidden="true"
                    />

                    {/* Brand */}
                    <div className="relative z-10 p-10 xl:p-14">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 text-xl font-black tracking-tight text-white"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-black text-zinc-950">
                                M
                            </span>

                            Marketplace
                        </Link>
                    </div>

                    {/* Main Message */}
                    <div className="relative z-10 max-w-xl px-10 pb-12 xl:px-14">
                        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300">
                            One marketplace. Thousands of possibilities.
                        </span>

                        <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-white xl:text-5xl">
                            Shop, sell, and manage everything from one place.
                        </h1>

                        <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-400 xl:text-base">
                            Join our marketplace to discover products from trusted sellers,
                            manage your orders, save your favourites, or start selling your
                            own products.
                        </p>

                        {/* Benefits */}
                        <div className="mt-10 grid gap-4 sm:grid-cols-2">
                            <AuthBenefit
                                title="Secure Shopping"
                                description="Your account and transactions stay protected."
                            />

                            <AuthBenefit
                                title="Trusted Sellers"
                                description="Discover products from marketplace sellers."
                            />

                            <AuthBenefit
                                title="Easy Orders"
                                description="Track and manage your purchases from one account."
                            />

                            <AuthBenefit
                                title="Start Selling"
                                description="Upgrade your marketplace account to start selling."
                            />
                        </div>
                    </div>

                    {/* Bottom */}
                    <div className="relative z-10 border-t border-white/10 px-10 py-6 xl:px-14">
                        <p className="text-xs text-zinc-500">
                            Secure marketplace authentication
                        </p>
                    </div>
                </section>

                {/* Right Side - Auth Form */}
                <section className="flex min-h-screen flex-col">
                    {/* Mobile Header */}
                    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-4 lg:hidden">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-lg font-black tracking-tight text-zinc-950"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-xs font-black text-white">
                                M
                            </span>

                            Marketplace
                        </Link>

                        <Link
                            href="/"
                            className="text-sm font-semibold text-zinc-500 transition hover:text-zinc-950"
                        >
                            Back to store
                        </Link>
                    </header>

                    {/* Form Container */}
                    <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
                        <div className="w-full max-w-md">
                            {children}
                        </div>
                    </div>

                    {/* Right Bottom */}
                    <footer className="px-5 pb-6 text-center text-xs text-zinc-400 sm:px-8">
                        By continuing, you agree to our{" "}
                        <Link
                            href="/terms"
                            className="font-medium text-zinc-600 hover:text-zinc-950"
                        >
                            Terms
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            className="font-medium text-zinc-600 hover:text-zinc-950"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </footer>
                </section>
            </div>
        </main>
    );
}

interface AuthBenefitProps {
    title: string;
    description: string;
}

function AuthBenefit({
    title,
    description,
}: AuthBenefitProps) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4 text-white"
                    aria-hidden="true"
                >
                    <path
                        d="M5 12.5L9.2 16.5L19 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            <h2 className="text-sm font-bold text-white">
                {title}
            </h2>

            <p className="mt-1 text-xs leading-5 text-zinc-400">
                {description}
            </p>
        </div>
    );
}