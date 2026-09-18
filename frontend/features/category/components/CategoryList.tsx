"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
    fetchCategories,
    setSelectedCategory,
} from "../store/categorySlice";

import {
    selectCategories,
    selectCategoryError,
    selectCategoryLoading,
} from "../store/categorySelector";

import CategoryCard from "./CategoryCard";

interface CategoryListProps {
    selectable?: boolean;
    showParent?: boolean;
    showStatus?: boolean;
    hrefPrefix?: string;
    emptyMessage?: string;
}

export default function CategoryList({
    selectable = false,
    showParent = true,
    showStatus = false,
    hrefPrefix = "/categories",
    emptyMessage = "No categories found.",
}: CategoryListProps) {
    const dispatch = useAppDispatch();

    const categories = useAppSelector(selectCategories);
    const loading = useAppSelector(selectCategoryLoading);
    const error = useAppSelector(selectCategoryError);

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    /*
     * Loading
     */
    if (loading) {
        return (
            <div
                className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    lg:grid-cols-3
                    xl:grid-cols-4
                "
            >
                {Array.from({ length: 8 }).map((_, index) => (
                    <CategoryCardSkeleton key={index} />
                ))}
            </div>
        );
    }

    /*
     * Error
     */
    if (error) {
        return (
            <div
                role="alert"
                className="
                    flex
                    min-h-32
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-default
                    bg-surface-muted
                    px-6
                    text-center
                "
            >
                <div>
                    <p className="font-medium text-primary">
                        Unable to load categories
                    </p>

                    <p className="mt-1 text-sm text-secondary">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    /*
     * Empty state
     */
    if (categories.length === 0) {
        return (
            <div
                className="
                    flex
                    min-h-64
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-dashed
                    border-default
                    bg-surface-muted
                    px-6
                    text-center
                "
            >
                <div className="max-w-sm">
                    <div
                        className="
                            mx-auto
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-full
                            bg-surface
                            text-secondary
                            shadow-sm
                        "
                    >
                        <span className="text-lg">⊞</span>
                    </div>

                    <h3 className="mt-4 font-semibold text-primary">
                        No categories yet
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-secondary">
                        {emptyMessage}
                    </p>
                </div>
            </div>
        );
    }

    /*
     * Category grid
     */
    return (
        <div
            className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
            "
        >
            {categories.map((category) => (
                <CategoryCard
                    key={category._id}
                    category={category}
                    showParent={showParent}
                    showStatus={showStatus}
                    href={
                        selectable
                            ? undefined
                            : `${hrefPrefix}/${category.slug}`
                    }
                    onClick={
                        selectable
                            ? () =>
                                dispatch(
                                    setSelectedCategory(category),
                                )
                            : undefined
                    }
                />
            ))}
        </div>
    );
}

/*
 * Skeleton matching the modern category card.
 */
function CategoryCardSkeleton() {
    return (
        <div
            className="
                overflow-hidden
                rounded-2xl
                border
                border-default
                bg-surface
            "
        >
            {/* Image */}
            <div
                className="
                    aspect-[16/10]
                    animate-pulse
                    bg-surface-muted
                "
            />

            {/* Content */}
            <div className="space-y-3 p-4">
                <div className="h-5 w-2/3 animate-pulse rounded bg-surface-muted" />

                <div className="h-4 w-full animate-pulse rounded bg-surface-muted" />

                <div className="h-4 w-1/2 animate-pulse rounded bg-surface-muted" />

                <div className="pt-2">
                    <div className="h-9 w-full animate-pulse rounded-lg bg-surface-muted" />
                </div>
            </div>
        </div>
    );
}