"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import api from "@/services/axios";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createProduct, updateProduct } from "../store/Productslice";
import { selectProductError, selectProductMutating } from "../store/Productselectors";
import type { Product } from "../types/product.types";

interface CategoryOption {
    _id: string;
    name: string;
    slug: string;
}

interface ProductFormProps {
    /** Pass the existing product to switch the form into edit mode. */
    product?: Product;
}

const emptyForm = {
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    stock: "0",
    weightKg: "0.5",
};

export default function ProductForm({ product }: ProductFormProps) {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const mutating = useAppSelector(selectProductMutating);
    const error = useAppSelector(selectProductError);

    const isEditMode = Boolean(product);

    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const [form, setForm] = useState(emptyForm);
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    // Load categories for the select dropdown.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { data } = await api.get<CategoryOption[]>("/categories");
                if (!cancelled) setCategories(data);
            } catch {
                if (!cancelled) setLocalError("Couldn't load categories.");
            } finally {
                if (!cancelled) setCategoriesLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // Prefill on edit.
    useEffect(() => {
        if (!product) return;

        const categorySlug =
            typeof product.category === "string" ? "" : product.category.slug;

        setForm({
            name: product.name,
            description: product.description ?? "",
            price: String(product.price),
            discountPrice: product.discountPrice ? String(product.discountPrice) : "",
            category: categorySlug,
            stock: String(product.stock),
            weightKg: String(product.weightKg ?? 0.5),
        });
        setImages(product.images ?? []);
    }, [product]);

    const handleChange = (field: keyof typeof form, value: string) => {
        setForm((f) => ({ ...f, [field]: value }));
    };

    const handleImageUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        setLocalError(null);

        try {
            const uploaded: string[] = [];
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append("image", file);
                const { data } = await api.post<{ url: string }>(
                    "/upload/product-images",
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } },
                );
                uploaded.push(data.url);
            }
            setImages((prev) => [...prev, ...uploaded]);
        } catch {
            setLocalError("Image upload failed. Try again.");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (url: string) => {
        setImages((prev) => prev.filter((img) => img !== url));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!form.name.trim() || !form.price || !form.category) {
            setLocalError("Name, price and category are required.");
            return;
        }

        const payload = {
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            price: Number(form.price),
            discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
            images,
            category: form.category,
            stock: form.stock ? Number(form.stock) : undefined,
            weightKg: form.weightKg ? Number(form.weightKg) : undefined,
        };

        const result =
            isEditMode && product
                ? await dispatch(updateProduct({ id: product._id, data: payload }))
                : await dispatch(createProduct(payload));

        const succeeded = isEditMode
            ? updateProduct.fulfilled.match(result)
            : createProduct.fulfilled.match(result);

        if (succeeded) {
            router.push("/dashboard/products");
        }
    };

    return (
        <div className="mx-auto max-w-2xl p-4 sm:p-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <h1 className="mb-1 text-lg font-semibold text-gray-900 sm:text-xl">
                    {isEditMode ? "Edit product" : "Add a new product"}
                </h1>
                <p className="mb-6 text-sm text-gray-500">
                    {isEditMode
                        ? "Update the details below."
                        : "Fill in the details to list a new product."}
                </p>

                {(error || localError) && (
                    <div className="mb-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
                        {localError || error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Images */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Images
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {images.map((img) => (
                                <div
                                    key={img}
                                    className="group relative h-20 w-20 overflow-hidden rounded-xl border border-gray-200"
                                >
                                    <Image src={img} alt="" fill className="object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(img)}
                                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                    >
                                        <svg
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            className="h-3 w-3"
                                        >
                                            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                                        </svg>
                                    </button>
                                </div>
                            ))}

                            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-500">
                                {uploading ? (
                                    <span className="text-[11px]">Uploading...</span>
                                ) : (
                                    <>
                                        <svg
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            className="h-5 w-5"
                                        >
                                            <path d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1Z" />
                                        </svg>
                                        <span className="text-[11px]">Add</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    hidden
                                    disabled={uploading}
                                    onChange={(e) => handleImageUpload(e.target.files)}
                                />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Product name
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            required
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            rows={4}
                            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Price (₹)
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={form.price}
                                onChange={(e) => handleChange("price", e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Discount price
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={form.discountPrice}
                                onChange={(e) => handleChange("discountPrice", e.target.value)}
                                placeholder="Optional"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Category
                        </label>
                        <select
                            value={form.category}
                            onChange={(e) => handleChange("category", e.target.value)}
                            required
                            disabled={categoriesLoading}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                        >
                            <option value="" disabled>
                                {categoriesLoading ? "Loading categories..." : "Select a category"}
                            </option>
                            {categories.map((c) => (
                                <option key={c._id} value={c.slug}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Stock
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={form.stock}
                                onChange={(e) => handleChange("stock", e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Weight (kg)
                            </label>
                            <input
                                type="number"
                                min={0}
                                step="0.1"
                                value={form.weightKg}
                                onChange={(e) => handleChange("weightKg", e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutating || uploading}
                            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800 disabled:opacity-50"
                        >
                            {mutating
                                ? "Saving..."
                                : isEditMode
                                    ? "Save changes"
                                    : "Create product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}