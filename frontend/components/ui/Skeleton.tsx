import type {
    HTMLAttributes,
} from "react";

export default function Skeleton({
    className = "",
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            aria-hidden="true"
            className={`
                animate-pulse rounded-lg
                bg-zinc-200 dark:bg-zinc-800
                ${className}
            `}
            {...props}
        />
    );
}