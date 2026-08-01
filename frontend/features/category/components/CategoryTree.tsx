"use client";

import { ChevronRight, FolderTree } from "lucide-react";

import type { Category } from "../types/category.types";

interface CategoryTreeProps {
    categories: Category[];

    selectedCategoryId?: string;

    onSelect?: (category: Category) => void;
}

export default function CategoryTree({
    categories,
    selectedCategoryId,
    onSelect,
}: CategoryTreeProps) {
    const rootCategories = categories.filter(
        (category) => !category.parent,
    );

    const getChildren = (
        parentId: string,
    ): Category[] =>
        categories.filter(
            (category) =>
                category.parent?._id === parentId,
        );

    const renderTree = (
        category: Category,
        level = 0,
    ) => {
        const children = getChildren(
            category._id,
        );

        const isSelected =
            selectedCategoryId ===
            category._id;

        return (
            <div
                key={category._id}
                className="space-y-2"
            >
                <button
                    type="button"
                    onClick={() =>
                        onSelect?.(category)
                    }
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left transition ${
                        isSelected
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    style={{
                        paddingLeft: `${
                            level * 24 + 12
                        }px`,
                    }}
                >
                    {children.length > 0 ? (
                        <ChevronRight
                            size={16}
                            className="mr-2 shrink-0"
                        />
                    ) : (
                        <FolderTree
                            size={16}
                            className="mr-2 shrink-0"
                        />
                    )}

                    <span className="flex-1 truncate">
                        {category.name}
                    </span>

                    {!category.isActive && (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-600 dark:bg-red-900/40 dark:text-red-400">
                            Inactive
                        </span>
                    )}
                </button>

                {children.length > 0 && (
                    <div>
                        {children.map(
                            (child) =>
                                renderTree(
                                    child,
                                    level + 1,
                                ),
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (rootCategories.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-6 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
                No categories found.
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center gap-2">
                <FolderTree
                    className="text-blue-600"
                    size={20}
                />

                <h2 className="text-lg font-semibold">
                    Category Tree
                </h2>
            </div>

            <div className="space-y-2">
                {rootCategories.map(
                    (category) =>
                        renderTree(category),
                )}
            </div>
        </div>
    );
}