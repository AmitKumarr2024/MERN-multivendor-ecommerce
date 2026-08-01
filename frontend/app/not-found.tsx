
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-16">
      <div className="w-full max-w-xl text-center">
        {/* 404 */}
        <p className="text-8xl font-black tracking-tight text-zinc-200 sm:text-9xl">
          404
        </p>

        {/* Icon */}
        <div className="mx-auto -mt-4 flex h-16 w-16 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-7 w-7 text-zinc-700"
            aria-hidden="true"
          >
            <path
              d="M21 21L16.65 16.65"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
        </div>

        {/* Message */}
        <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">
          Page Not Found
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
          We couldn&apos;t find that page
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-zinc-600 sm:text-base">
          The page you&apos;re looking for may have been moved, removed, or the
          address may be incorrect.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
          >
            Go to Homepage
          </Link>

          <Link
            href="/products"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
          >
            Browse Products
          </Link>
        </div>

        {/* Help text */}
        <p className="mt-10 text-xs text-zinc-400">
          Error code: 404
        </p>
      </div>
    </main>
  );
}

