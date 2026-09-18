"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, FolderTree } from "lucide-react";

import type { Category } from "@/features/category";

interface HomeCategoryNavProps {
    categories: Category[];
    selectedCategory?: string | null;
    onSelect?: (category: string | null) => void;
}

/*
 * =================================================================
 * Restyled to match the hero's glassmorphic direction — same logic,
 * same props, only classNames changed:
 *  - flat bg-surface pills -> bg-surface/60 backdrop-blur-md
 *  - active state -> glow shadow (shadow-accent/25) instead of a
 *    flat color swap, echoing the CTA button in the hero
 *  - dropdown panel -> bg-surface/80 backdrop-blur-lg instead of
 *    a fully opaque bg-surface, so it reads as glass over content
 * =================================================================
 */

export default function HomeCategoryNav({
    categories,
    selectedCategory = null,
    onSelect,
}: HomeCategoryNavProps) {
    const rootCategories = useMemo(() => {
        return categories.filter((category) => category.isActive && !category.parent);
    }, [categories]);

    const getChildren = (parentId: string) => {
        return categories.filter(
            (category) => category.isActive && category.parent?._id === parentId,
        );
    };

    const handleSelect = (slug: string | null) => {
        onSelect?.(slug);
    };

    if (rootCategories.length === 0) {
        return null;
    }

    return (
        <nav aria-label="Product categories" className="w-full">
            <div className="flex items-center gap-2">
                {/* =================================================
                    ALL PRODUCTS
                ================================================= */}

                <button
                    type="button"
                    onClick={() => handleSelect(null)}
                    className={`
                        shrink-0
                        rounded-full
                        border
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        backdrop-blur-md
                        transition
                        ${!selectedCategory
                            ? "border-accent/60 bg-accent text-accent-foreground shadow-lg shadow-accent/25"
                            : "border-default/60 bg-surface/60 text-secondary hover:border-accent/40 hover:text-primary"
                        }
                    `}
                >
                    All
                </button>

                {/* =================================================
                    CATEGORY SCROLLER
                ================================================= */}

                <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto scrollbar-none">
                    {rootCategories.map((category) => {
                        const children = getChildren(category._id);

                        const isSelected =
                            selectedCategory === category.slug ||
                            selectedCategory === category._id;

                        /*
                         * -----------------------------------------
                         * CATEGORY WITH CHILDREN
                         * -----------------------------------------
                         */

                        if (children.length > 0) {
                            return (
                                <div key={category._id} className="group relative shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(category.slug)}
                                        className={`
                                            inline-flex
                                            items-center
                                            gap-1.5
                                            rounded-full
                                            border
                                            px-4
                                            py-2
                                            text-sm
                                            font-medium
                                            backdrop-blur-md
                                            transition
                                            ${isSelected
                                                ? "border-accent/60 bg-accent text-accent-foreground shadow-lg shadow-accent/25"
                                                : "border-default/60 bg-surface/60 text-secondary hover:border-accent/40 hover:text-primary"
                                            }
                                        `}
                                    >
                                        {category.image ? (
                                            <img
                                                src={category.image}
                                                alt=""
                                                className="h-5 w-5 rounded-full object-cover"
                                            />
                                        ) : (
                                            <FolderTree className="h-4 w-4" />
                                        )}

                                        <span>{category.name}</span>

                                        <ChevronDown className="h-3.5 w-3.5" />
                                    </button>

                                    {/* =================================================
                                        DROPDOWN — glass panel
                                    ================================================= */}

                                    <div
                                        className="
                                            invisible
                                            absolute
                                            left-0
                                            top-full
                                            z-30
                                            mt-2
                                            w-56
                                            translate-y-1
                                            rounded-xl
                                            border
                                            border-default/50
                                            bg-surface/80
                                            p-2
                                            opacity-0
                                            shadow-xl
                                            backdrop-blur-lg
                                            transition-all
                                            group-hover:visible
                                            group-hover:translate-y-0
                                            group-hover:opacity-100
                                        "
                                    >
                                        {/* Parent */}

                                        <button
                                            type="button"
                                            onClick={() => handleSelect(category.slug)}
                                            className="
                                                flex
                                                w-full
                                                items-center
                                                justify-between
                                                rounded-lg
                                                px-3
                                                py-2
                                                text-left
                                                text-sm
                                                font-semibold
                                                text-primary
                                                transition
                                                hover:bg-accent/10
                                            "
                                        >
                                            <span>All {category.name}</span>
                                            <ChevronRight className="h-4 w-4 text-muted" />
                                        </button>

                                        <div className="my-1 border-t border-default/50" />

                                        {/* Children */}

                                        {children.map((child) => {
                                            const childSelected =
                                                selectedCategory === child.slug ||
                                                selectedCategory === child._id;

                                            return (
                                                <button
                                                    key={child._id}
                                                    type="button"
                                                    onClick={() => handleSelect(child.slug)}
                                                    className={`
                                                        flex
                                                        w-full
                                                        items-center
                                                        rounded-lg
                                                        px-3
                                                        py-2
                                                        text-left
                                                        text-sm
                                                        transition
                                                        ${childSelected
                                                            ? "bg-accent/10 font-semibold text-accent"
                                                            : "text-secondary hover:bg-surface-hover hover:text-primary"
                                                        }
                                                    `}
                                                >
                                                    {child.image ? (
                                                        <img
                                                            src={child.image}
                                                            alt=""
                                                            className="mr-2 h-6 w-6 rounded-md object-cover"
                                                        />
                                                    ) : (
                                                        <FolderTree className="mr-2 h-4 w-4 text-muted" />
                                                    )}

                                                    <span className="truncate">{child.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        }

                        /*
                         * -----------------------------------------
                         * CATEGORY WITHOUT CHILDREN
                         * -----------------------------------------
                         */

                        return (
                            <button
                                key={category._id}
                                type="button"
                                onClick={() => handleSelect(category.slug)}
                                className={`
                                    inline-flex
                                    shrink-0
                                    items-center
                                    gap-1.5
                                    rounded-full
                                    border
                                    px-4
                                    py-2
                                    text-sm
                                    font-medium
                                    backdrop-blur-md
                                    transition
                                    ${isSelected
                                        ? "border-accent/60 bg-accent text-accent-foreground shadow-lg shadow-accent/25"
                                        : "border-default/60 bg-surface/60 text-secondary hover:border-accent/40 hover:text-primary"
                                    }
                                `}
                            >
                                {category.image ? (
                                    <img
                                        src={category.image}
                                        alt=""
                                        className="h-5 w-5 rounded-full object-cover"
                                    />
                                ) : (
                                    <FolderTree className="h-4 w-4" />
                                )}

                                <span>{category.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}