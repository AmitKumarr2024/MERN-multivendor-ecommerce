"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import api from "@/services/axios";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createProduct, updateProduct } from "../store/Productslice";
import { selectProductError, selectProductMutating } from "../store/Productselectors";
import type { Product } from "../types/product.types";
import { MultiImageUploadField } from "@/features/upload";
import type { UploadResult } from "@/features/upload";

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

// Shared input style — one place to tweak so every field stays in sync.
const inputClass =
    "w-full rounded-lg border border-default bg-surface px-3 py-2.5 text-sm text-primary shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";
const labelClass = "mb-1.5 block text-sm font-medium text-primary";

export default function ProductForm({ product }: ProductFormProps) {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const mutating = useAppSelector(selectProductMutating);
    const error = useAppSelector(selectProductError);

    const isEditMode = Boolean(product);

    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const [form, setForm] = useState(emptyForm);
    // Uploaded images, kept as {url, publicId} pairs so MultiImageUploadField
    // can call DELETE /api/upload/image with the publicId when removing one.
    const [images, setImages] = useState<UploadResult[]>([]);
    const [localError, setLocalError] = useState<string | null>(null);

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

        // Existing product only has image URLs, not publicIds — that's fine,
        // publicId is only needed if the user removes one of these during
        // this edit session (MultiImageUploadField calls delete with it).
        setImages((product.images ?? []).map((url) => ({ url, publicId: url })));
    }, [product]);

    const handleChange = (field: keyof typeof form, value: string) => {
        setForm((f) => ({ ...f, [field]: value }));
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
            images: images.map((img) => img.url),
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
            router.push("/seller/products");
        }
    };

    return (
        <div className="mx-auto max-w-2xl p-4 sm:p-6">
            <div className="rounded-2xl border border-default bg-surface p-4 shadow-sm sm:p-6">
                <h1 className="mb-1 text-lg font-semibold text-primary sm:text-xl">
                    {isEditMode ? "Edit product" : "Add a new product"}
                </h1>
                <p className="mb-6 text-sm text-secondary">
                    {isEditMode
                        ? "Update the details below."
                        : "Fill in the details to list a new product."}
                </p>

                {(error || localError) && (
                    <div className="mb-4 rounded-lg bg-danger-bg px-3 py-2.5 text-sm text-danger-text">
                        {localError || error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <MultiImageUploadField
                        label="Images"
                        value={images}
                        onChange={setImages}
                    />

                    <div>
                        <label className={labelClass}>Product name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            rows={4}
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Price (₹)</label>
                            <input
                                type="number"
                                min={0}
                                value={form.price}
                                onChange={(e) => handleChange("price", e.target.value)}
                                required
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Discount price</label>
                            <input
                                type="number"
                                min={0}
                                value={form.discountPrice}
                                onChange={(e) => handleChange("discountPrice", e.target.value)}
                                placeholder="Optional"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Category</label>
                        <select
                            value={form.category}
                            onChange={(e) => handleChange("category", e.target.value)}
                            required
                            disabled={categoriesLoading}
                            className={inputClass}
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
                            <label className={labelClass}>Stock</label>
                            <input
                                type="number"
                                min={0}
                                value={form.stock}
                                onChange={(e) => handleChange("stock", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Weight (kg)</label>
                            <input
                                type="number"
                                min={0}
                                step="0.1"
                                value={form.weightKg}
                                onChange={(e) => handleChange("weightKg", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="rounded-lg border border-strong px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface-hover"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutating}
                            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground shadow-sm transition-colors hover:opacity-90 disabled:opacity-50"
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