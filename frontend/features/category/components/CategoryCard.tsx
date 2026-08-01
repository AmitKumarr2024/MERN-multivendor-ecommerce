"use client";

import Image from "next/image";
import Link from "next/link";
import { FolderTree } from "lucide-react";

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
        <div
            onClick={() => onClick?.(category)}
            className="group overflow-hidden rounded-xl border bg-white transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
        >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                {category.image ? (
                    <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <FolderTree className="h-12 w-12 text-gray-400" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="space-y-2 p-4">
                <h3 className="line-clamp-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {category.name}
                </h3>

                {showParent && category.parent && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Parent:{" "}
                        <span className="font-medium">
                            {category.parent.name}
                        </span>
                    </p>
                )}

                {showStatus && (
                    <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${category.isActive
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                    >
                        {category.isActive
                            ? "Active"
                            : "Inactive"}
                    </span>
                )}
            </div>
        </div>
    );

    if (href) {
        return (
            <Link href={href}>
                {content}
            </Link>
        );
    }

    return content;
}