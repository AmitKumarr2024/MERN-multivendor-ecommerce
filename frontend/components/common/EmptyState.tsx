"use client";

import Link from "next/link";
import { PackageOpen } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: ReactNode;
    actionLabel?: string;
    actionHref?: string;
    className?: string;
}

export default function EmptyState({
    title = "Nothing Found",
    description = "There is nothing to display at the moment.",
    icon,
    actionLabel,
    actionHref,
    className = "",
}: EmptyStateProps) {
    return (
        <div
            className={`flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-16 text-center ${className}`}
        >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
                {icon ?? <PackageOpen size={40} />}
            </div>

            <h2 className="text-xl font-semibold">
                {title}
            </h2>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                {description}
            </p>

            {actionHref && actionLabel && (
                <Link
                    href={actionHref}
                    className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}