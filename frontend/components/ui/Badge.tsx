import type {
    HTMLAttributes,
} from "react";

type BadgeVariant =
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "info";

interface BadgeProps
    extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
}

export default function Badge({
    children,
    variant = "default",
    className = "",
    ...props
}: BadgeProps) {
    const variants: Record<BadgeVariant, string> = {
        default:
            "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",

        success:
            "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",

        warning:
            "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",

        danger:
            "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",

        info:
            "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    };

    return (
        <span
            className={`
                inline-flex items-center rounded-full
                px-2.5 py-1 text-xs font-bold
                ${variants[variant]}
                ${className}
            `}
            {...props}
        >
            {children}
        </span>
    );
}