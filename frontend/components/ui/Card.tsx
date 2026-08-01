import type {
    HTMLAttributes,
    ReactNode,
} from "react";

interface CardProps
    extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export default function Card({
    children,
    className = "",
    ...props
}: CardProps) {
    return (
        <div
            className={`
                rounded-2xl border border-zinc-200
                bg-white
                dark:border-zinc-800 dark:bg-zinc-900
                ${className}
            `}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({
    children,
    className = "",
}: CardProps) {
    return (
        <div
            className={`border-b border-zinc-200 p-5 dark:border-zinc-800 ${className}`}
        >
            {children}
        </div>
    );
}

export function CardContent({
    children,
    className = "",
}: CardProps) {
    return (
        <div className={`p-5 ${className}`}>
            {children}
        </div>
    );
}

export function CardFooter({
    children,
    className = "",
}: CardProps) {
    return (
        <div
            className={`border-t border-zinc-200 p-5 dark:border-zinc-800 ${className}`}
        >
            {children}
        </div>
    );
}