interface PaginationProps {
    page: number;
    pages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ page, pages, onPageChange }: PaginationProps) {
    if (pages <= 1) return null;

    const goTo = (p: number) => {
        if (p >= 1 && p <= pages) onPageChange(p);
    };

    // Keep it simple on mobile: prev / current / next only.
    return (
        <div className="flex items-center justify-center gap-2 pt-2">
            <button
                type="button"
                onClick={() => goTo(page - 1)}
                disabled={page <= 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
            >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path
                        fillRule="evenodd"
                        d="M12.79 4.21a.75.75 0 0 1 0 1.06L8.06 10l4.73 4.73a.75.75 0 1 1-1.06 1.06l-5.26-5.26a.75.75 0 0 1 0-1.06l5.26-5.26a.75.75 0 0 1 1.06 0Z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            <span className="min-w-20 text-center text-sm font-medium text-gray-700">
                Page {page} of {pages}
            </span>

            <button
                type="button"
                onClick={() => goTo(page + 1)}
                disabled={page >= pages}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
            >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path
                        fillRule="evenodd"
                        d="M7.21 4.21a.75.75 0 0 1 1.06 0l5.26 5.26a.75.75 0 0 1 0 1.06l-5.26 5.26a.75.75 0 1 1-1.06-1.06L11.94 10 7.21 5.27a.75.75 0 0 1 0-1.06Z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
        </div>
    );
}