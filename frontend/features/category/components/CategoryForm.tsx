"use client";

import { useEffect, useState } from "react";

import type { Category, CreateCategoryPayload } from "../types/category.types";

interface CategoryFormProps {
    loading?: boolean;
    initialValues?: Partial<Category>;
    categories?: Category[];
    onSubmit: (values: CreateCategoryPayload) => void;
}

const inputClass =
    "w-full rounded-lg border border-default bg-surface px-3 py-2 text-primary outline-none focus:border-blue-500 dark:focus:border-blue-400";
const labelClass = "mb-2 block text-sm font-medium text-primary";

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
        setParent(initialValues.parent?._id ?? "");
    }, [initialValues]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        onSubmit({
            name: name.trim(),
            image: image.trim(),
            parent: parent === "" ? null : parent,
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-xl border border-default bg-surface p-6 shadow-sm"
        >
            {/* Category Name */}
            <div>
                <label className={labelClass}>Category Name</label>
                <input
                    type="text"
                    value={name}
                    required
                    placeholder="Electronics"
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                />
            </div>

            {/* Parent Category */}
            <div>
                <label className={labelClass}>Parent Category</label>
                <select
                    value={parent}
                    onChange={(e) => setParent(e.target.value)}
                    className={inputClass}
                >
                    <option value="">None</option>
                    {categories
                        .filter((category) => category._id !== initialValues?._id)
                        .map((category) => (
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                </select>
            </div>

            {/* Image */}
            <div>
                <label className={labelClass}>Image URL</label>
                <input
                    type="url"
                    value={image}
                    placeholder="https://..."
                    onChange={(e) => setImage(e.target.value)}
                    className={inputClass}
                />
            </div>

            {/* Preview */}
            {image && (
                <img
                    src={image}
                    alt="Preview"
                    className="h-40 w-40 rounded-lg border border-default object-cover"
                />
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={loading || name.trim() === ""}
                className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
            >
                {loading ? "Saving..." : initialValues ? "Update Category" : "Create Category"}
            </button>
        </form>
    );
}