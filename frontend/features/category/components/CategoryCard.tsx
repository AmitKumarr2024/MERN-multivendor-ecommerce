"use client";

import Image from "next/image";
import Link from "next/link";
import {
    ArrowUpRight,
    CheckCircle2,
    FolderTree,
} from "lucide-react";

import type { Category } from "../types/category.types";

interface CategoryCardProps {
    category: Category;
    href?: string;
    showParent?: boolean;
    showStatus?: boolean;
    onClick?: (category: Category) => void;
}

export default function CategoryCard({
    category,
    href,
    showParent = true,
    showStatus = false,
    onClick,
}: CategoryCardProps) {
    const content = (
        <article
            onClick={() => onClick?.(category)}
            className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-default
                bg-surface
                shadow-sm
                transition-all
                duration-300
                ease-out
                hover:-translate-y-1
                hover:shadow-xl
                focus-within:ring-2
                focus-within:ring-primary/20
            "
        >
            {/* Image */}
            <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
                {category.image ? (
                    <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes="
                            (max-width: 640px) 100vw,
                            (max-width: 1024px) 50vw,
                            25vw
                        "
                        className="
                            object-cover
                            transition-transform
                            duration-700
                            ease-out
                            group-hover:scale-110
                        "
                    />
                ) : (
                    <div
                        className="
                            flex
                            h-full
                            w-full
                            items-center
                            justify-center
                            bg-linear-to-br
                            from-surface-muted
                            to-surface
                        "
                    >
                        <div
                            className="
                                flex
                                h-16
                                w-16
                                items-center
                                justify-center
                                rounded-2xl
                                border
                                border-default
                                bg-surface/80
                                shadow-sm
                            "
                        >
                            <FolderTree className="h-7 w-7 text-secondary" />
                        </div>
                    </div>
                )}

                {/* Image overlay */}
                <div
                    className="
                        absolute
                        inset-0
                        bg-linear-to-t
                        from-black/70
                        via-black/10
                        to-transparent
                        opacity-90
                    "
                />

                {/* Top status */}
                {showStatus && (
                    <div className="absolute left-3 top-3">
                        <span
                            className={`
                                inline-flex
                                items-center
                                gap-1.5
                                rounded-full
                                border
                                px-2.5
                                py-1
                                text-xs
                                font-medium
                                shadow-sm
                                backdrop-blur-md
                                ${category.isActive
                                    ? "border-white/20 bg-black/30 text-white"
                                    : "border-red-200/30 bg-red-500/80 text-white"
                                }
                            `}
                        >
                            {category.isActive && (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                            )}

                            {category.isActive
                                ? "Active"
                                : "Inactive"}
                        </span>
                    </div>
                )}

                {/* Floating arrow */}
                <div
                    className="
                        absolute
                        right-3
                        top-3
                        flex
                        h-10
                        w-10
                        translate-y-1
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/20
                        bg-black/30
                        text-white
                        opacity-0
                        shadow-lg
                        backdrop-blur-md
                        transition-all
                        duration-300
                        group-hover:translate-y-0
                        group-hover:opacity-100
                    "
                >
                    <ArrowUpRight
                        className="
                            h-5
                            w-5
                            transition-transform
                            duration-300
                            group-hover:rotate-0
                        "
                    />
                </div>

                {/* Category name over image */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3
                        className="
                            line-clamp-1
                            text-xl
                            font-bold
                            tracking-tight
                            text-white
                            drop-shadow-sm
                        "
                    >
                        {category.name}
                    </h3>

                    {showParent && category.parent && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-white/75">
                            <FolderTree className="h-3.5 w-3.5" />

                            <span className="truncate">
                                {category.parent.name}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom content */}
            <div className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-secondary">
                        Category
                    </p>

                    <p className="mt-1 truncate text-sm font-medium text-primary">
                        Explore products
                    </p>
                </div>

                <div
                    className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-surface-muted
                        text-secondary
                        transition-all
                        duration-300
                        group-hover:bg-primary
                        group-hover:text-primary-foreground
                    "
                >
                    <ArrowUpRight className="h-4 w-4" />
                </div>
            </div>
        </article>
    );

    if (href) {
        return (
            <Link
                href={href}
                className="block rounded-2xl focus:outline-none"
                aria-label={`Browse ${category.name}`}
            >
                {content}
            </Link>
        );
    }

    return content;
}