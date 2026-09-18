interface StaffSkeletonProps {
    view: "card" | "table";
}

export default function StaffSkeleton({ view }: StaffSkeletonProps) {
    if (view === "table") {
        return (
            <div className="overflow-hidden rounded-3xl border border-default bg-surface shadow-sm">
                <div className="divide-y divide-default">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
                            <div className="h-9 w-9 animate-pulse rounded-xl bg-surface-muted" />
                            <div className="h-3.5 w-28 animate-pulse rounded bg-surface-muted" />
                            <div className="h-3.5 w-20 animate-pulse rounded bg-surface-muted" />
                            <div className="ml-auto h-3.5 w-12 animate-pulse rounded bg-surface-muted" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-3xl border border-default bg-surface p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 animate-pulse rounded-2xl bg-surface-muted" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-32 animate-pulse rounded bg-surface-muted" />
                            <div className="h-3 w-24 animate-pulse rounded bg-surface-muted" />
                        </div>
                    </div>
                    <div className="mt-4 h-8 animate-pulse rounded-xl bg-surface-muted" />
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="h-14 animate-pulse rounded-2xl bg-surface-muted" />
                        <div className="h-14 animate-pulse rounded-2xl bg-surface-muted" />
                    </div>
                    <div className="mt-4 h-9 animate-pulse rounded-xl bg-surface-muted" />
                </div>
            ))}
        </div>
    );
}