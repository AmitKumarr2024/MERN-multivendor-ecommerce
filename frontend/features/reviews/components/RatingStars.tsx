"use client";

interface RatingStarsProps {
    value: number;
    size?: "sm" | "md" | "lg";
    readOnly?: boolean;
    interactive?: boolean;
    onChange?: (rating: number) => void;
}

const SIZE_CLASS = { sm: "h-3.5 w-3.5", md: "h-5 w-5", lg: "h-7 w-7" };

export default function RatingStars({
    value,
    size = "md",
    interactive = false,
    onChange,
}: RatingStarsProps) {
    return (
        <div className="flex items-center gap-0.5" role={interactive ? "radiogroup" : undefined}>
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= Math.round(value);
                return (
                    <button
                        key={star}
                        type="button"
                        disabled={!interactive}
                        onClick={() => interactive && onChange?.(star)}
                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                        className={interactive ? "cursor-pointer" : "cursor-default"}
                    >
                        <svg
                            viewBox="0 0 20 20"
                            className={`${SIZE_CLASS[size]} ${filled ? "fill-amber-400" : "fill-none stroke-amber-400"
                                }`}
                            strokeWidth={filled ? 0 : 1.5}
                        >
                            <path d="M10 1.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.8l-5.2 2.7 1-5.8L1.6 7.6l5.8-.8L10 1.5Z" />
                        </svg>
                    </button>
                );
            })}
        </div>
    );
}