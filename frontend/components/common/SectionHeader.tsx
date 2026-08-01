"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    viewAllHref?: string;
    viewAllLabel?: string;
    className?: string;
}

export default function SectionHeader({
    title,
    subtitle,
    viewAllHref,
    viewAllLabel = "View All",
    className = "",
}: SectionHeaderProps) {
    return (
        <div
            className={`flex items-end justify-between gap-4 ${className}`}
        >
            <div>
                <h2 className="text-2xl font-bold tracking-tight">
                    {title}
                </h2>

                {subtitle && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {subtitle}
                    </p>
                )}
            </div>

            {viewAllHref && (
                <Link
                    href={viewAllHref}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:underline"
                >
                    {viewAllLabel}

                    <ChevronRight size={16} />
                </Link>
            )}
        </div>
    );
}