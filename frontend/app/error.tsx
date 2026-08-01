
"use client";

import { useEffect } from "react";

interface ErrorPageProps {
    error: Error & {
        digest?: string;
    };
    reset: () => void;
}

export default function ErrorPage({
    error,
    reset,
}: ErrorPageProps) {
    useEffect(() => {
        // Later this can be replaced with Sentry or another logging service.
        console.error("Application error:", error);
    }, [error]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-16">
            <div className="w-full max-w-lg text-center">
                {/* Error Icon */}
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/50">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-10 w-10 text-red-600"
                        aria-hidden="true"
                    >
                        <path
                            d="M12 9V13"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />

                        <path
                            d="M12 17.01L12.01 16.9989"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                        />

                        <path
                            d="M10.29 3.86L2.82 17A2 2 0 004.56 20H19.44A2 2 0 0021.18 17L13.71 3.86A2 2 0 0010.29 3.86Z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                {/* Status */}
                <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-red-600">
                    Something went wrong
                </p>

                {/* Heading */}
                <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
                    We couldn&apos;t load this page
                </h1>

                {/* Description */}
                <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-zinc-600 sm:text-base">
                    An unexpected error occurred while processing your request. Please
                    try again. If the problem continues, you can return to the homepage.
                </p>

                {/* Actions */}
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={reset}
                        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
                    >
                        Try Again
                    </button>

                    <a
                        href="/"
                        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
                    >
                        Go to Homepage
                    </a>
                </div>

                {/* Reference */}
                {error.digest && (
                    <p className="mt-8 text-xs text-zinc-400">
                        Error reference: {error.digest}
                    </p>
                )}
            </div>
        </main>
    );
}

