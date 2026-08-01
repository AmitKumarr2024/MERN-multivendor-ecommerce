"use client";

import { useEffect, useState } from "react";

import type {
    Category,
    CreateCategoryPayload,
} from "../types/category.types";

interface CategoryFormProps {
    loading?: boolean;

    initialValues?: Partial<Category>;

    categories?: Category[];

    onSubmit: (
        values: CreateCategoryPayload,
    ) => void;
}

export default function CategoryForm({
    loading = false,
    initialValues,
    categories = [],
    onSubmit,
}: CategoryFormProps) {
    const [name, setName] = useState("");

    const [image, setImage] = useState("");

    const [parent, setParent] = useState("");

    useEffect(() => {
        if (!initialValues) return;

        setName(initialValues.name ?? "");

        setImage(initialValues.image ?? "");

        setParent(
            initialValues.parent?._id ?? "",
        );
    }, [initialValues]);

    const handleSubmit = (
        e: React.FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();

        onSubmit({
            name: name.trim(),

            image: image.trim(),

            parent:
                parent === ""
                    ? null
                    : parent,
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >
            {/* Category Name */}
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Category Name
                </label>

                <input
                    type="text"
                    value={name}
                    required
                    placeholder="Electronics"
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800"
                />
            </div>

            {/* Parent Category */}
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Parent Category
                </label>

                <select
                    value={parent}
                    onChange={(e) =>
                        setParent(e.target.value)
                    }
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800"
                >
                    <option value="">
                        None
                    </option>

                    {categories
                        .filter(
                            (category) =>
                                category._id !==
                                initialValues?._id,
                        )
                        .map((category) => (
                            <option
                                key={category._id}
                                value={
                                    category._id
                                }
                            >
                                {category.name}
                            </option>
                        ))}
                </select>
            </div>

            {/* Image */}
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Image URL
                </label>

                <input
                    type="url"
                    value={image}
                    placeholder="https://..."
                    onChange={(e) =>
                        setImage(
                            e.target.value,
                        )
                    }
                    className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800"
                />
            </div>

            {/* Preview */}
            {image && (
                <img
                    src={image}
                    alt="Preview"
                    className="h-40 w-40 rounded-lg border object-cover"
                />
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={
                    loading ||
                    name.trim() === ""
                }
                className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading
                    ? "Saving..."
                    : initialValues
                          ? "Update Category"
                          : "Create Category"}
            </button>
        </form>
    );
}