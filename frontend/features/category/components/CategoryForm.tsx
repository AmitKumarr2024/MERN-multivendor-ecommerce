"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

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
        imageFile?: File | null,
    ) => void;
}

const inputClass =
    "w-full rounded-lg border border-default bg-surface px-3 py-2 text-primary outline-none focus:border-blue-500 dark:focus:border-blue-400";

const labelClass =
    "mb-2 block text-sm font-medium text-primary";

export default function CategoryForm({
    loading = false,
    initialValues,
    categories = [],
    onSubmit,
}: CategoryFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const cameraInputRef =
        useRef<HTMLInputElement>(null);

    const [name, setName] = useState("");
    const [image, setImage] = useState("");
    const [imageFile, setImageFile] =
        useState<File | null>(null);
    const [parent, setParent] = useState("");

    useEffect(() => {
        if (!initialValues) {
            setName("");
            setImage("");
            setImageFile(null);
            setParent("");
            return;
        }

        setName(initialValues.name ?? "");
        setImage(initialValues.image ?? "");
        setImageFile(null);
        setParent(initialValues.parent?._id ?? "");
    }, [initialValues]);

    /*
     * =========================================================
     * IMAGE SELECTION
     * =========================================================
     */

    const handleImageSelect = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        if (!file) return;

        /*
         * Basic validation
         */

        if (!file.type.startsWith("image/")) {
            event.target.value = "";
            return;
        }

        /*
         * Optional size limit: 5MB
         */

        const maxSize = 5 * 1024 * 1024;

        if (file.size > maxSize) {
            event.target.value = "";
            return;
        }

        /*
         * Release previous preview URL
         */

        if (
            image.startsWith("blob:")
        ) {
            URL.revokeObjectURL(image);
        }

        const previewUrl =
            URL.createObjectURL(file);

        setImageFile(file);
        setImage(previewUrl);
    };

    /*
     * =========================================================
     * REMOVE IMAGE
     * =========================================================
     */

    const handleRemoveImage = () => {
        if (image.startsWith("blob:")) {
            URL.revokeObjectURL(image);
        }

        setImage("");
        setImageFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        if (cameraInputRef.current) {
            cameraInputRef.current.value = "";
        }
    };

    /*
     * =========================================================
     * SUBMIT
     * =========================================================
     */

    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        onSubmit(
            {
                name: name.trim(),

                /*
                 * Existing image URL is preserved when editing.
                 *
                 * New local image is passed separately as imageFile.
                 */
                image: imageFile
                    ? ""
                    : image.trim(),

                parent:
                    parent === ""
                        ? null
                        : parent,
            },
            imageFile,
        );
    };

    /*
     * =========================================================
     * CLEANUP
     * =========================================================
     */

    useEffect(() => {
        return () => {
            if (image.startsWith("blob:")) {
                URL.revokeObjectURL(image);
            }
        };
    }, [image]);

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-xl border border-default bg-surface p-6 shadow-sm"
        >
            {/* =================================================
                CATEGORY NAME
            ================================================= */}

            <div>
                <label className={labelClass}>
                    Category Name
                </label>

                <input
                    type="text"
                    value={name}
                    required
                    placeholder="Electronics"
                    onChange={(event) =>
                        setName(event.target.value)
                    }
                    className={inputClass}
                />
            </div>

            {/* =================================================
                PARENT CATEGORY
            ================================================= */}

            <div>
                <label className={labelClass}>
                    Parent Category
                </label>

                <select
                    value={parent}
                    onChange={(event) =>
                        setParent(event.target.value)
                    }
                    className={inputClass}
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
                                value={category._id}
                            >
                                {category.name}
                            </option>
                        ))}
                </select>
            </div>

            {/* =================================================
                CATEGORY IMAGE
            ================================================= */}

            <div>
                <label className={labelClass}>
                    Category Image
                </label>

                {/* Hidden device picker */}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                />

                {/* Hidden camera picker */}

                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageSelect}
                />

                {!image ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {/* =================================================
                            DEVICE
                        ================================================= */}

                        <button
                            type="button"
                            onClick={() =>
                                fileInputRef.current?.click()
                            }
                            disabled={loading}
                            className="flex min-h-32 flex-col items-center justify-center rounded-xl border-2 border-dashed border-default bg-surface-muted px-4 py-6 text-center transition hover:border-blue-500 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-xl">
                                📁
                            </span>

                            <span className="mt-3 text-sm font-semibold text-primary">
                                Choose from device
                            </span>

                            <span className="mt-1 text-xs text-secondary">
                                JPG, PNG or WEBP
                            </span>
                        </button>

                        {/* =================================================
                            CAMERA
                        ================================================= */}

                        <button
                            type="button"
                            onClick={() =>
                                cameraInputRef.current?.click()
                            }
                            disabled={loading}
                            className="flex min-h-32 flex-col items-center justify-center rounded-xl border-2 border-dashed border-default bg-surface-muted px-4 py-6 text-center transition hover:border-blue-500 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-xl">
                                📷
                            </span>

                            <span className="mt-3 text-sm font-semibold text-primary">
                                Take photo
                            </span>

                            <span className="mt-1 text-xs text-secondary">
                                Use your camera
                            </span>
                        </button>
                    </div>
                ) : (
                    /* =================================================
                       IMAGE PREVIEW
                    ================================================= */

                    <div className="relative overflow-hidden rounded-xl border border-default bg-surface-muted p-3">
                        <img
                            src={image}
                            alt="Category preview"
                            className="h-56 w-full rounded-lg object-contain sm:h-64"
                        />

                        <div className="mt-3 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                                disabled={loading}
                                className="rounded-lg border border-default bg-surface px-4 py-2 text-sm font-medium text-primary transition hover:bg-surface-muted disabled:opacity-50"
                            >
                                Change image
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    cameraInputRef.current?.click()
                                }
                                disabled={loading}
                                className="rounded-lg border border-default bg-surface px-4 py-2 text-sm font-medium text-primary transition hover:bg-surface-muted disabled:opacity-50"
                            >
                                Take another
                            </button>

                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                disabled={loading}
                                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
                            >
                                Remove
                            </button>
                        </div>

                        {imageFile && (
                            <p className="mt-3 truncate text-xs text-secondary">
                                {imageFile.name}
                            </p>
                        )}
                    </div>
                )}

                <p className="mt-2 text-xs text-secondary">
                    Maximum file size: 5MB
                </p>
            </div>

            {/* =================================================
                SUBMIT
            ================================================= */}

            <button
                type="submit"
                disabled={
                    loading ||
                    name.trim() === ""
                }
                className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
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