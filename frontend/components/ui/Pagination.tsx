"use client";

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    page,
    totalPages,
    onPageChange,
}: PaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <nav
            aria-label="Pagination"
            className="flex items-center justify-center gap-2"
        >
            <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                    onPageChange(page - 1)
                }
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold disabled:opacity-40 dark:border-zinc-700"
            >
                Previous
            </button>

            <span className="px-3 text-sm text-zinc-500">
                Page{" "}
                <strong className="text-zinc-950 dark:text-white">
                    {page}
                </strong>{" "}
                of {totalPages}
            </span>

            <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                    onPageChange(page + 1)
                }
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold disabled:opacity-40 dark:border-zinc-700"
            >
                Next
            </button>
        </nav>
    );
}