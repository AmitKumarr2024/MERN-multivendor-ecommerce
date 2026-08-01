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

    const categories = useAppSelector(
        selectCategories,
    );

    const loading = useAppSelector(
        selectCategoryLoading,
    );

    const error = useAppSelector(
        selectCategoryError,
    );

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    if (loading) {
        return (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({
                    length: 8,
                }).map((_, index) => (
                    <div
                        key={index}
                        className="h-72 animate-pulse rounded-xl border bg-gray-100 dark:border-gray-800 dark:bg-gray-800"
                    />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                {error}
            </div>
        );
    }

    if (categories.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-10 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
                <CategoryCard
                    key={category._id}
                    category={category}
                    showParent={showParent}
                    showStatus={showStatus}
                    href={
                        selectable
                            ? undefined
                            : `/categories/${category.slug}`
                    }
                    onClick={
                        selectable
                            ? () =>
                                dispatch(
                                    setSelectedCategory(
                                        category,
                                    ),
                                )
                            : undefined
                    }
                />
            ))}
        </div>
    );
}