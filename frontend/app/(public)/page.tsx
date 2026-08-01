import Link from "next/link";

/**
 * This is the ONLY file that should render the "/" route.
 *
 * Delete `app/page.jsx` — having both `app/page.jsx` and
 * `app/(public)/page.tsx` means two files resolve to the same
 * URL ("/"), since route groups like `(public)` don't appear
 * in the URL. Next.js will only actually use one of them,
 * which is why your changes to one file may not show up.
 *
 * Navbar and Footer are already rendered once in
 * app/layout.tsx (root layout) — don't import/render them
 * again here or on any other page.
 */
export default function HomePage() {
    return (
        <main className="min-h-screen">
            {/* Hero */}
            <section className="bg-linear-to-b from-zinc-50 to-white">
                <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                        Now live across India
                    </span>

                    <h1 className="mt-5 text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl">
                        Shop from trusted sellers,
                        <br className="hidden sm:block" />
                        all in one marketplace.
                    </h1>

                    <p className="mx-auto mt-4 max-w-xl text-sm text-zinc-500 sm:text-base">
                        Discover quality products across electronics, fashion, home &amp;
                        living, and more — delivered fast, backed by secure payments.
                    </p>

                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href="/products"
                            className="w-full rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-zinc-800 sm:w-auto"
                        >
                            Start shopping
                        </Link>
                        <Link
                            href="/seller/register"
                            className="w-full rounded-full border border-zinc-200 px-6 py-3 text-sm font-bold text-zinc-800 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white sm:w-auto"
                        >
                            Sell on Marketplace
                        </Link>
                    </div>
                </div>
            </section>

            {/*
              TODO: replace these placeholder sections with real
              data-driven ones as those features land, e.g.
              <FeaturedProducts /> from features/products,
              <FeaturedShops /> from features/shop, etc.
            */}
            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-zinc-950 sm:text-xl">
                        Popular categories
                    </h2>
                    <Link
                        href="/categories"
                        className="text-sm font-semibold text-zinc-600 hover:text-zinc-950"
                    >
                        View all →
                    </Link>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
                    {[
                        "Electronics",
                        "Fashion",
                        "Home & Living",
                        "Beauty",
                        "Sports",
                        "Accessories",
                    ].map((category) => (
                        <Link
                            key={category}
                            href={`/categories/${category.toLowerCase().replace(/\s+&?\s*/g, "-")}`}
                            className="flex h-24 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-3 text-center text-sm font-medium text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            {category}
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
}