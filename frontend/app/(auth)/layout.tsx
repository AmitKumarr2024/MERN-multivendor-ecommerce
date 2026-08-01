import Link from "next/link";

interface AuthLayoutProps {
    children: React.ReactNode;
}

/**
 * =========================================================
 * AUTH LAYOUT
 * =========================================================
 *
 * Shared responsive UI shell for authentication pages.
 *
 * Desktop:
 * Brand information on the left + auth form on the right.
 *
 * Tablet:
 * Branding is hidden and auth content appears inside a
 * centered card.
 *
 * Mobile:
 * Full-width auth experience with a compact header.
 *
 * Used by:
 * app/(auth)/layout.tsx
 * =========================================================
 */

export default function AuthLayout({
    children,
}: AuthLayoutProps) {
    return (
        <main className="min-h-dvh bg-zinc-50 dark:bg-zinc-950">

            <div className="grid min-h-dvh lg:grid-cols-[45%_55%] xl:grid-cols-2">

                {/* =====================================================
            LEFT BRAND PANEL

            Hidden below lg screens to preserve space on
            mobile/tablet devices.
        ===================================================== */}

                <section className="relative hidden min-h-dvh overflow-hidden bg-zinc-950 lg:flex lg:flex-col lg:justify-between">

                    {/* Decorative background */}
                    <div
                        aria-hidden="true"
                        className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl"
                    />

                    <div
                        aria-hidden="true"
                        className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-white/5 blur-3xl"
                    />

                    {/* Brand */}
                    <div className="relative z-10 px-8 py-8 xl:px-12 xl:py-10 2xl:px-16">
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

                    {/* Main content */}
                    <div className="relative z-10 max-w-2xl px-8 py-10 xl:px-12 2xl:px-16">

                        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300">
                            One marketplace. Thousands of possibilities.
                        </span>

                        <h1 className="mt-6 text-3xl font-black leading-tight tracking-tight text-white xl:text-4xl 2xl:text-5xl">
                            Shop, sell, and manage everything from one place.
                        </h1>

                        <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400 xl:text-base">
                            Discover products from trusted sellers, manage
                            your orders, save favourites, or start selling
                            your own products.
                        </p>

                        {/* Benefits */}
                        <div className="mt-8 grid gap-3 xl:mt-10 xl:grid-cols-2">

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
                                description="Track and manage purchases from one account."
                            />

                            <AuthBenefit
                                title="Start Selling"
                                description="Upgrade your account and start selling."
                            />

                        </div>
                    </div>

                    {/* Bottom */}
                    <div className="relative z-10 border-t border-white/10 px-8 py-5 xl:px-12 2xl:px-16">
                        <p className="text-xs text-zinc-500">
                            Secure marketplace authentication
                        </p>
                    </div>
                </section>


                {/* =====================================================
            RIGHT AUTH SECTION
        ===================================================== */}

                <section className="flex min-h-dvh min-w-0 flex-col">

                    {/* Mobile / Tablet header */}
                    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-4 sm:px-6 lg:hidden dark:border-zinc-800 dark:bg-zinc-950">

                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-lg font-black tracking-tight text-zinc-950 dark:text-white"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-xs font-black text-white dark:bg-white dark:text-zinc-950">
                                M
                            </span>

                            <span className="hidden xs:inline sm:inline">
                                Marketplace
                            </span>
                        </Link>

                        <Link
                            href="/"
                            className="text-xs font-semibold text-zinc-500 transition hover:text-zinc-950 sm:text-sm dark:text-zinc-400 dark:hover:text-white"
                        >
                            Back to store
                        </Link>
                    </header>


                    {/* ===================================================
              FORM AREA

              Mobile:
              Almost full width.

              Tablet:
              Centered card.

              Desktop:
              Larger centered card.
          =================================================== */}

                    <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10 md:px-10 lg:px-8 xl:px-12">

                        <div className="w-full max-w-md sm:max-w-lg">

                            <div className="
                w-full
                rounded-2xl
                border border-zinc-200
                bg-white
                p-5
                shadow-sm

                sm:rounded-3xl
                sm:p-8
                sm:shadow-xl
                sm:shadow-zinc-200/40

                lg:p-8
                xl:p-10

                dark:border-zinc-800
                dark:bg-zinc-900
                dark:shadow-none
              ">
                                {children}
                            </div>

                        </div>
                    </div>


                    {/* Bottom legal links */}
                    <footer className="px-4 pb-5 text-center text-xs leading-5 text-zinc-400 sm:px-6 sm:pb-6">

                        By continuing, you agree to our{" "}

                        <Link
                            href="/terms"
                            className="font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                        >
                            Terms
                        </Link>

                        {" "}and{" "}

                        <Link
                            href="/privacy"
                            className="font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
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


/* =========================================================
   AUTH BENEFIT CARD

   Small informational card displayed on the desktop
   branding panel.
========================================================= */

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