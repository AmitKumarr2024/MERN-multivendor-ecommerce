export default function Loading() {
    return (
        <main
            className="min-h-screen bg-surface text-primary"
            aria-busy="true"
            aria-label="Loading page"
        >
            {/* Hero Skeleton */}
            <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
                <div className="min-h-80 animate-pulse rounded-2xl bg-surface-muted p-8 sm:p-10 lg:p-16">
                    <div className="max-w-2xl">
                        <div className="h-4 w-32 rounded bg-surface-hover" />

                        <div className="mt-5 h-10 w-full max-w-lg rounded bg-surface-hover" />

                        <div className="mt-3 h-10 w-3/4 max-w-md rounded bg-surface-hover" />

                        <div className="mt-6 h-4 w-full max-w-xl rounded bg-surface-hover" />

                        <div className="mt-2 h-4 w-4/5 max-w-lg rounded bg-surface-hover" />

                        <div className="mt-7 h-11 w-28 rounded-lg bg-surface-hover" />
                    </div>
                </div>
            </section>

            {/* Category Skeleton */}
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-6 animate-pulse">
                    <div className="h-7 w-48 rounded bg-surface-muted" />
                    <div className="mt-2 h-4 w-64 rounded bg-surface-muted" />
                </div>

                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div
                            key={index}
                            className="animate-pulse rounded-xl border border-default bg-surface p-4"
                        >
                            <div className="mx-auto aspect-square w-full max-w-20 rounded-full bg-surface-muted" />
                            <div className="mx-auto mt-3 h-3 w-16 rounded bg-surface-muted" />
                        </div>
                    ))}
                </div>
            </section>

            {/* Product Section Skeleton */}
            <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-end justify-between">
                    <div className="animate-pulse">
                        <div className="h-7 w-44 rounded bg-surface-muted" />
                        <div className="mt-2 h-4 w-56 rounded bg-surface-muted" />
                    </div>

                    <div className="h-4 w-16 animate-pulse rounded bg-surface-muted" />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div
                            key={index}
                            className="overflow-hidden rounded-xl border border-default bg-surface"
                        >
                            <div className="aspect-square animate-pulse bg-surface-muted" />

                            <div className="p-5">
                                <div className="h-4 w-3/4 animate-pulse rounded bg-surface-muted" />

                                <div className="mt-3 h-3 w-full animate-pulse rounded bg-surface-muted" />

                                <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-surface-muted" />

                                <div className="mt-5 flex items-center justify-between">
                                    <div className="h-4 w-16 animate-pulse rounded bg-surface-muted" />
                                    <div className="h-6 w-20 animate-pulse rounded bg-surface-muted" />
                                </div>

                                <div className="mt-5 h-10 w-full animate-pulse rounded-lg bg-surface-muted" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}