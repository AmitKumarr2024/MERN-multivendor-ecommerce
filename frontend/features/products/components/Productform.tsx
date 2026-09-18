"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ChevronDown,
    CircleHelp,
    ImagePlus,
    Package,
    Plus,
    Save,
    Settings2,
    Sparkles,
    Store,
    Trash2,
    X,
} from "lucide-react";

import api from "@/services/axios";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
    createProduct,
    updateProduct,
} from "../store/Productslice";

import {
    selectProductError,
    selectProductMutating,
} from "../store/Productselectors";

import type {
    Product,
    ProductSpecification,
    ProductVariant,
} from "../types/product.types";

import { MultiImageUploadField } from "@/features/upload";
import type { UploadResult } from "@/features/upload";

interface CategoryOption {
    _id: string;
    name: string;
    slug: string;
}

interface ProductFormProps {
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

interface VariantDraft {
    key: string;
    _id?: string;
    color: string;
    size: string;
    sku: string;
    price: string;
    discountPrice: string;
    stock: string;
    images: UploadResult[];
}

interface SpecDraft {
    key: string;
    label: string;
    value: string;
}

const makeKey = () =>
    Math.random().toString(36).slice(2);

const inputClass = `
    w-full rounded-xl border border-default
    bg-surface px-3.5 py-3
    text-sm text-primary
    outline-none transition-all
    placeholder:text-muted
    hover:border-strong
    focus:border-accent
    focus:ring-4 focus:ring-accent/10
`;

const labelClass =
    "mb-2 block text-sm font-medium text-primary";

const helperClass =
    "mt-1.5 text-xs leading-5 text-muted";

const smallInputClass = `
    w-full rounded-lg border border-default
    bg-surface px-3 py-2.5
    text-sm text-primary
    outline-none transition-all
    placeholder:text-muted
    focus:border-accent
    focus:ring-2 focus:ring-accent/10
`;

export default function ProductForm({
    product,
}: ProductFormProps) {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const mutating = useAppSelector(selectProductMutating);
    const error = useAppSelector(selectProductError);

    const isEditMode = Boolean(product);

    const [categories, setCategories] =
        useState<CategoryOption[]>([]);

    const [categoriesLoading, setCategoriesLoading] =
        useState(true);

    const [form, setForm] =
        useState(emptyForm);

    const [images, setImages] =
        useState<UploadResult[]>([]);

    const [localError, setLocalError] =
        useState<string | null>(null);

    const [specs, setSpecs] =
        useState<SpecDraft[]>([]);

    const [hasVariants, setHasVariants] =
        useState(false);

    const [variants, setVariants] =
        useState<VariantDraft[]>([]);

    const [specsOpen, setSpecsOpen] =
        useState(true);

    const [variantsOpen, setVariantsOpen] =
        useState(true);

    // Tracks the "syncing variants" sub-step separately from the main
    // `mutating` redux flag, since variant sync happens as several
    // sequential API calls AFTER the main product PUT resolves.
    const [syncingVariants, setSyncingVariants] =
        useState(false);

    const isSaving = mutating || syncingVariants;

    /* ============================================================
       LOAD CATEGORIES
    ============================================================ */

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const { data } =
                    await api.get<CategoryOption[]>(
                        "/categories",
                    );

                if (!cancelled) {
                    setCategories(data);
                }
            } catch {
                if (!cancelled) {
                    setLocalError(
                        "Couldn't load categories.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setCategoriesLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    /* ============================================================
       EDIT MODE
    ============================================================ */

    useEffect(() => {
        if (!product) return;

        const categorySlug =
            typeof product.category === "string"
                ? ""
                : product.category.slug;

        setForm({
            name: product.name,
            description: product.description ?? "",
            price: String(product.price),
            discountPrice:
                product.discountPrice != null
                    ? String(product.discountPrice)
                    : "",
            category: categorySlug,
            stock: String(product.stock ?? 0),
            weightKg: String(
                product.weightKg ?? 0.5,
            ),
        });

        setImages(
            (product.images ?? []).map((url) => ({
                url,
                publicId: url,
            })),
        );

        setSpecs(
            (product.specifications ?? []).map(
                (s) => ({
                    key: makeKey(),
                    label: s.label,
                    value: s.value,
                }),
            ),
        );

        setHasVariants(
            Boolean(product.hasVariants),
        );

        setVariants(
            (product.variants ?? []).map((v) => ({
                key: makeKey(),
                _id: v._id,
                color: v.color ?? "",
                size: v.size ?? "",
                sku: v.sku ?? "",
                price:
                    v.price != null
                        ? String(v.price)
                        : "",
                discountPrice:
                    v.discountPrice != null
                        ? String(v.discountPrice)
                        : "",
                stock: String(v.stock ?? 0),
                images: (v.images ?? []).map(
                    (url) => ({
                        url,
                        publicId: url,
                    }),
                ),
            })),
        );
    }, [product]);

    /* ============================================================
       FORM
    ============================================================ */

    const handleChange = (
        field: keyof typeof form,
        value: string,
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    /* ============================================================
       SPECIFICATIONS
    ============================================================ */

    const addSpecRow = () => {
        setSpecs((current) => [
            ...current,
            {
                key: makeKey(),
                label: "",
                value: "",
            },
        ]);
    };

    const updateSpecRow = (
        key: string,
        field: "label" | "value",
        value: string,
    ) => {
        setSpecs((current) =>
            current.map((row) =>
                row.key === key
                    ? {
                        ...row,
                        [field]: value,
                    }
                    : row,
            ),
        );
    };

    const removeSpecRow = (key: string) => {
        setSpecs((current) =>
            current.filter(
                (row) => row.key !== key,
            ),
        );
    };

    /* ============================================================
       VARIANTS
    ============================================================ */

    const addVariantRow = () => {
        setVariants((current) => [
            ...current,
            {
                key: makeKey(),
                color: "",
                size: "",
                sku: "",
                price: "",
                discountPrice: "",
                stock: "0",
                images: [],
            },
        ]);

        setVariantsOpen(true);
    };

    const updateVariantRow = (
        key: string,
        field: keyof VariantDraft,
        value: string,
    ) => {
        setVariants((current) =>
            current.map((row) =>
                row.key === key
                    ? {
                        ...row,
                        [field]: value,
                    }
                    : row,
            ),
        );
    };

    const updateVariantImages = (
        key: string,
        imgs: UploadResult[],
    ) => {
        setVariants((current) =>
            current.map((row) =>
                row.key === key
                    ? {
                        ...row,
                        images: imgs,
                    }
                    : row,
            ),
        );
    };

    const removeVariantRow = (key: string) => {
        setVariants((current) =>
            current.filter(
                (row) => row.key !== key,
            ),
        );
    };

    const handleToggleVariants = (
        checked: boolean,
    ) => {
        setHasVariants(checked);

        if (
            checked &&
            variants.length === 0
        ) {
            addVariantRow();
        }
    };

    /* ============================================================
       STOCK FIX
       ------------------------------------------------------------
       For normal products:
         stock = form.stock

       For variant products:
         stock = SUM of all variant stocks

       Availability:
         variant product is in stock when ANY
         configured variant has stock > 0.
    ============================================================ */

    const configuredVariants = useMemo(
        () =>
            variants.filter(
                (v) =>
                    v.color.trim() ||
                    v.size.trim(),
            ),
        [variants],
    );

    const variantStockTotal = useMemo(
        () =>
            configuredVariants.reduce(
                (total, variant) => {
                    const stock =
                        Number(variant.stock);

                    return (
                        total +
                        (Number.isFinite(stock) &&
                            stock > 0
                            ? stock
                            : 0)
                    );
                },
                0,
            ),
        [configuredVariants],
    );

    const normalStock = useMemo(() => {
        const stock = Number(form.stock);

        return Number.isFinite(stock) &&
            stock > 0
            ? stock
            : 0;
    }, [form.stock]);

    const totalStock = hasVariants
        ? variantStockTotal
        : normalStock;

    const isInStock =
        totalStock > 0;

    const isOutOfStock =
        totalStock <= 0;

    /* ============================================================
       VARIANT SYNC (edit mode only)
       ------------------------------------------------------------
       PUT /api/products/:id intentionally ignores `variants` and
       `hasVariants` on the backend (see product.update.controller.js -
       it's a deliberate safety guard against an accidental full-array
       overwrite wiping out per-variant stock). Variants must instead
       go through their own dedicated endpoints:

         POST   /api/products/:id/variants               (new row)
         PUT    /api/products/:id/variants/:variantId     (existing row)
         DELETE /api/products/:id/variants/:variantId     (removed row)

       This function diffs the current draft rows against the variants
       the product had when the form loaded, and fires the right calls.
    ============================================================ */

    const toVariantPayload = (row: VariantDraft) => ({
        // Zod's z.string().optional() accepts a missing/undefined field,
        // but NOT null - unlike Mongoose which is fine with null. Sending
        // null here (as we used to) causes a 400: "Invalid input: expected
        // string, received null". Use undefined for empty optional fields
        // so JSON.stringify drops the key entirely instead of sending null.
        color: row.color.trim() || undefined,
        size: row.size.trim() || undefined,
        sku: row.sku.trim() || undefined,
        price:
            row.price !== ""
                ? Number(row.price)
                : undefined,
        discountPrice:
            row.discountPrice !== ""
                ? Number(row.discountPrice)
                : undefined,
        stock: Number(row.stock),
        images: row.images.map((img) => img.url),
    });

    const syncVariants = async (productId: string) => {
        const originalVariants = product?.variants ?? [];

        // eslint-disable-next-line no-console
        // console.log("[syncVariants] start", {
        //     productId,
        //     hasVariants,
        //     originalVariants,
        //     configuredVariants,
        // });

        if (!hasVariants) {
            // Toggled off -> delete every variant that existed before.
            // Backend auto-flips hasVariants back to false once the
            // variants array is empty (see deleteVariant controller).
            for (const v of originalVariants) {
                if (v._id) {
                    try {
                        // console.log(
                        //     "[syncVariants] DELETE (toggle off) ->",
                        //     `/products/${productId}/variants/${v._id}`,
                        // );

                        const res = await api.delete(
                            `/products/${productId}/variants/${v._id}`,
                        );

                        // console.log(
                        //     "[syncVariants] DELETE ok",
                        //     res.status,
                        //     res.data,
                        // );
                    } catch (err: any) {
                        console.error(
                            "[syncVariants] DELETE FAILED",
                            {
                                url: `/products/${productId}/variants/${v._id}`,
                                status: err?.response?.status,
                                responseData: err?.response?.data,
                                message: err?.message,
                            },
                        );
                        throw err;
                    }
                }
            }
            return;
        }

        const currentIds = new Set(
            configuredVariants
                .filter((v) => v._id)
                .map((v) => v._id as string),
        );

        const toDelete = originalVariants.filter(
            (v) => v._id && !currentIds.has(v._id),
        );

        const toUpdate = configuredVariants.filter(
            (v) => v._id,
        );

        const toCreate = configuredVariants.filter(
            (v) => !v._id,
        );

        // console.log("[syncVariants] plan", {
        //     toDelete,
        //     toUpdate,
        //     toCreate,
        // });

        for (const v of toDelete) {
            const url = `/products/${productId}/variants/${v._id}`;

            try {
                // console.log("[syncVariants] DELETE ->", url);

                const res = await api.delete(url);

                // console.log(
                //     "[syncVariants] DELETE ok",
                //     res.status,
                //     res.data,
                // );
            } catch (err: any) {
                console.error("[syncVariants] DELETE FAILED", {
                    url,
                    status: err?.response?.status,
                    responseData: err?.response?.data,
                    message: err?.message,
                });
                throw err;
            }
        }

        for (const v of toUpdate) {
            const url = `/products/${productId}/variants/${v._id}`;
            const body = toVariantPayload(v);

            try {
                // console.log("[syncVariants] PUT ->", url, "body:", body);

                const res = await api.put(url, body);

                // console.log(
                //     "[syncVariants] PUT ok",
                //     res.status,
                //     res.data,
                // );
            } catch (err: any) {
                console.error("[syncVariants] PUT FAILED", {
                    url,
                    body,
                    status: err?.response?.status,
                    responseData: err?.response?.data,
                    message: err?.message,
                });
                throw err;
            }
        }

        for (const v of toCreate) {
            const url = `/products/${productId}/variants`;
            const body = toVariantPayload(v);

            try {
                // console.log("[syncVariants] POST ->", url, "body:", body);

                const res = await api.post(url, body);

                // console.log(
                //     "[syncVariants] POST ok",
                //     res.status,
                //     res.data,
                // );
            } catch (err: any) {
                console.error("[syncVariants] POST FAILED", {
                    url,
                    body,
                    status: err?.response?.status,
                    responseData: err?.response?.data,
                    message: err?.message,
                });
                throw err;
            }
        }

        // console.log("[syncVariants] done");
    };

    /* ============================================================
       SUBMIT
    ============================================================ */

    const handleSubmit = async (
        e: React.FormEvent,
    ) => {
        e.preventDefault();

        setLocalError(null);

        if (
            !form.name.trim() ||
            !form.price ||
            !form.category
        ) {
            setLocalError(
                "Name, price and category are required.",
            );

            return;
        }

        const cleanSpecs: ProductSpecification[] =
            specs
                .filter(
                    (s) =>
                        s.label.trim() &&
                        s.value.trim(),
                )
                .map((s) => ({
                    label: s.label.trim(),
                    value: s.value.trim(),
                }));

        let cleanVariants:
            Omit<ProductVariant, "_id">[] = [];

        if (hasVariants) {
            if (
                configuredVariants.length === 0
            ) {
                setLocalError(
                    "Add at least one size/color option, or turn off variants.",
                );

                return;
            }

            for (const row of configuredVariants) {
                const stock =
                    Number(row.stock);

                if (
                    row.stock === "" ||
                    !Number.isFinite(stock) ||
                    stock < 0
                ) {
                    setLocalError(
                        `Enter a valid stock number for ${row.color ||
                        row.size ||
                        "each"
                        } option.`,
                    );

                    return;
                }

                if (
                    row.price !== "" &&
                    (!Number.isFinite(
                        Number(row.price),
                    ) ||
                        Number(row.price) < 0)
                ) {
                    setLocalError(
                        `Enter a valid price for ${row.color ||
                        row.size ||
                        "each"
                        } option.`,
                    );

                    return;
                }

                if (
                    row.discountPrice !== "" &&
                    (!Number.isFinite(
                        Number(
                            row.discountPrice,
                        ),
                    ) ||
                        Number(
                            row.discountPrice,
                        ) < 0)
                ) {
                    setLocalError(
                        `Enter a valid discount price for ${row.color ||
                        row.size ||
                        "each"
                        } option.`,
                    );

                    return;
                }
            }

            cleanVariants =
                configuredVariants.map(
                    (row) => ({
                        color:
                            row.color.trim() ||
                            null,

                        size:
                            row.size.trim() ||
                            null,

                        sku:
                            row.sku.trim() ||
                            null,

                        price:
                            row.price !== ""
                                ? Number(
                                    row.price,
                                )
                                : null,

                        discountPrice:
                            row.discountPrice !==
                                ""
                                ? Number(
                                    row.discountPrice,
                                )
                                : null,

                        stock: Number(
                            row.stock,
                        ),

                        images:
                            row.images.map(
                                (img) =>
                                    img.url,
                            ),
                    }),
                );
        } else {
            const stock =
                Number(form.stock);

            if (
                !Number.isFinite(stock) ||
                stock < 0
            ) {
                setLocalError(
                    "Enter a valid stock quantity.",
                );

                return;
            }
        }

        const payload = {
            name: form.name.trim(),

            description:
                form.description.trim() ||
                undefined,

            specifications: cleanSpecs,

            price: Number(form.price),

            discountPrice:
                form.discountPrice !== ""
                    ? Number(
                        form.discountPrice,
                    )
                    : undefined,

            images: images.map(
                (img) => img.url,
            ),

            category: form.category,

            /*
             * IMPORTANT:
             *
             * Variant products keep inventory
             * inside variants[].stock.
             *
             * Do NOT set the product's flat
             * stock to the variant total unless
             * the backend explicitly expects that.
             */
            stock: hasVariants
                ? undefined
                : Number(form.stock),

            weightKg:
                form.weightKg !== ""
                    ? Number(form.weightKg)
                    : undefined,

            hasVariants,

            variants: hasVariants
                ? cleanVariants
                : [],
        };

        if (isEditMode && product) {
            // In edit mode, `variants`/`hasVariants` never go through the
            // main PUT - the backend deliberately ignores them there (see
            // product.update.controller.js). Strip them out and sync
            // separately via the dedicated variant endpoints instead.
            const {
                variants: _variants,
                hasVariants: _hasVariants,
                ...mainPayload
            } = payload;

            const result = await dispatch(
                updateProduct({
                    id: product._id,
                    data: mainPayload,
                }),
            );

            if (!updateProduct.fulfilled.match(result)) {
                return; // error already set in redux state
            }

            try {
                setSyncingVariants(true);
                await syncVariants(product._id);
            } catch (err) {
                console.error(
                    "[handleSubmit] variant sync failed:",
                    err,
                );
                setLocalError(
                    "Product saved, but updating options (variants) failed. Please try saving again.",
                );
                return;
            } finally {
                setSyncingVariants(false);
            }

            router.push("/seller/products");
            return;
        }

        // Create mode - backend accepts variants directly on POST /products
        const result = await dispatch(
            createProduct(payload),
        );

        if (createProduct.fulfilled.match(result)) {
            router.push("/seller/products");
        }
    };

    /* ============================================================
       DERIVED UI
    ============================================================ */

    const completedSpecs =
        specs.filter(
            (s) =>
                s.label.trim() &&
                s.value.trim(),
        ).length;

    const variantCount =
        configuredVariants.length;

    const imageCount = images.length;

    return (
        <main className="min-h-screen bg-surface-muted/30">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="mb-8">
                    <button
                        type="button"
                        onClick={() =>
                            router.back()
                        }
                        className="
                            mb-5 inline-flex items-center
                            gap-2 text-sm font-medium
                            text-secondary
                            transition-colors
                            hover:text-primary
                        "
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to products
                    </button>

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
                                    Seller Center
                                </span>

                                {isEditMode && (
                                    <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-muted ring-1 ring-default">
                                        Editing product
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                                {isEditMode
                                    ? "Edit product"
                                    : "Add a new product"}
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
                                {isEditMode
                                    ? "Update your product information, pricing, inventory and options."
                                    : "Create a product listing that looks great and gives customers the information they need."}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`
                                        h-2 w-2 rounded-full
                                        ${isSaving
                                            ? "animate-pulse bg-amber-500"
                                            : "bg-emerald-500"
                                        }
                                    `}
                                />

                                {syncingVariants
                                    ? "Saving options..."
                                    : mutating
                                        ? "Saving..."
                                        : "All changes ready"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==================================================
                    ERROR
                ================================================== */}

                {(error || localError) && (
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-danger-bg bg-danger-bg/50 px-4 py-3.5 text-sm text-danger-text">
                        <CircleHelp className="mt-0.5 h-4 w-4 shrink-0" />

                        <div>
                            <p className="font-semibold">
                                Couldn't save product
                            </p>

                            <p className="mt-0.5">
                                {localError ||
                                    error}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setLocalError(
                                    null,
                                )
                            }
                            className="ml-auto rounded-lg p-1 transition-colors hover:bg-danger-bg"
                            aria-label="Dismiss error"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"
                >
                    <div className="min-w-0 space-y-6">
                        {/* ==================================================
                            IMAGES
                        ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-default bg-surface">
                            <div className="border-b border-default px-5 py-4 sm:px-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-base font-semibold text-primary">
                                            Product images
                                        </h2>

                                        <p className="mt-1 text-xs text-muted">
                                            Add up to 5 high-quality images.
                                        </p>
                                    </div>

                                    <div className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-secondary">
                                        {imageCount} / 5
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 sm:p-6">
                                <MultiImageUploadField
                                    label=""
                                    value={images}
                                    onChange={
                                        setImages
                                    }
                                />

                                <div className="mt-4 flex items-start gap-2 text-xs text-muted">
                                    <ImagePlus className="mt-0.5 h-4 w-4 shrink-0" />

                                    <p>
                                        Use clear product photos with
                                        good lighting. Your first image
                                        will be the primary product image.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* ==================================================
                            BASIC INFORMATION
                        ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-default bg-surface">
                            <div className="border-b border-default px-5 py-4 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                                        <Sparkles className="h-4 w-4 text-accent" />
                                    </div>

                                    <div>
                                        <h2 className="text-base font-semibold text-primary">
                                            Basic information
                                        </h2>

                                        <p className="mt-0.5 text-xs text-muted">
                                            Tell customers what you're selling.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5 p-5 sm:p-6">
                                <div>
                                    <label
                                        htmlFor="product-name"
                                        className={
                                            labelClass
                                        }
                                    >
                                        Product name
                                    </label>

                                    <input
                                        id="product-name"
                                        type="text"
                                        value={
                                            form.name
                                        }
                                        onChange={(
                                            e,
                                        ) =>
                                            handleChange(
                                                "name",
                                                e.target
                                                    .value,
                                            )
                                        }
                                        required
                                        placeholder="e.g. Samsung Galaxy M35 5G"
                                        className={
                                            inputClass
                                        }
                                    />

                                    <p
                                        className={
                                            helperClass
                                        }
                                    >
                                        Keep it short, specific and easy to
                                        understand.
                                    </p>
                                </div>

                                <div>
                                    <label
                                        htmlFor="product-description"
                                        className={
                                            labelClass
                                        }
                                    >
                                        Description
                                    </label>

                                    <textarea
                                        id="product-description"
                                        value={
                                            form.description
                                        }
                                        onChange={(
                                            e,
                                        ) =>
                                            handleChange(
                                                "description",
                                                e.target
                                                    .value,
                                            )
                                        }
                                        rows={5}
                                        placeholder="Describe the product, its benefits and what customers should know..."
                                        className={`${inputClass} resize-y`}
                                    />

                                    <div className="mt-1.5 flex justify-end text-xs text-muted">
                                        {
                                            form
                                                .description
                                                .length
                                        }{" "}
                                        characters
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ==================================================
                            PRICING
                        ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-default bg-surface">
                            <div className="border-b border-default px-5 py-4 sm:px-6">
                                <h2 className="text-base font-semibold text-primary">
                                    Pricing
                                </h2>

                                <p className="mt-1 text-xs text-muted">
                                    Set your selling price and optional discount.
                                </p>
                            </div>

                            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                                <div>
                                    <label
                                        htmlFor="product-price"
                                        className={
                                            labelClass
                                        }
                                    >
                                        Price (₹)
                                        {hasVariants && (
                                            <span className="ml-1 font-normal text-muted">
                                                · starting price
                                            </span>
                                        )}
                                    </label>

                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
                                            ₹
                                        </span>

                                        <input
                                            id="product-price"
                                            type="number"
                                            min={0}
                                            value={
                                                form.price
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                handleChange(
                                                    "price",
                                                    e.target
                                                        .value,
                                                )
                                            }
                                            required
                                            placeholder="0"
                                            className={`${inputClass} pl-8`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="discount-price"
                                        className={
                                            labelClass
                                        }
                                    >
                                        Discount price
                                        <span className="ml-1 font-normal text-muted">
                                            · optional
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">
                                            ₹
                                        </span>

                                        <input
                                            id="discount-price"
                                            type="number"
                                            min={0}
                                            value={
                                                form.discountPrice
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                handleChange(
                                                    "discountPrice",
                                                    e.target
                                                        .value,
                                                )
                                            }
                                            placeholder="No discount"
                                            className={`${inputClass} pl-8`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ==================================================
                            INVENTORY
                        ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-default bg-surface">
                            <div className="border-b border-default px-5 py-4 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-muted">
                                        <Package className="h-4 w-4 text-primary" />
                                    </div>

                                    <div>
                                        <h2 className="text-base font-semibold text-primary">
                                            Inventory & shipping
                                        </h2>

                                        <p className="mt-0.5 text-xs text-muted">
                                            Manage stock and product weight.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5 p-5 sm:p-6">
                                <div>
                                    <label
                                        htmlFor="category"
                                        className={
                                            labelClass
                                        }
                                    >
                                        Category
                                    </label>

                                    <select
                                        id="category"
                                        value={
                                            form.category
                                        }
                                        onChange={(
                                            e,
                                        ) =>
                                            handleChange(
                                                "category",
                                                e.target
                                                    .value,
                                            )
                                        }
                                        required
                                        disabled={
                                            categoriesLoading
                                        }
                                        className={
                                            inputClass
                                        }
                                    >
                                        <option
                                            value=""
                                            disabled
                                        >
                                            {categoriesLoading
                                                ? "Loading categories..."
                                                : "Select a category"}
                                        </option>

                                        {categories.map(
                                            (
                                                category,
                                            ) => (
                                                <option
                                                    key={
                                                        category._id
                                                    }
                                                    value={
                                                        category.slug
                                                    }
                                                >
                                                    {
                                                        category.name
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    {!hasVariants && (
                                        <div>
                                            <label
                                                htmlFor="stock"
                                                className={
                                                    labelClass
                                                }
                                            >
                                                Stock quantity
                                            </label>

                                            <input
                                                id="stock"
                                                type="number"
                                                min={0}
                                                value={
                                                    form.stock
                                                }
                                                onChange={(
                                                    e,
                                                ) =>
                                                    handleChange(
                                                        "stock",
                                                        e
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                className={
                                                    inputClass
                                                }
                                            />
                                        </div>
                                    )}

                                    <div
                                        className={
                                            hasVariants
                                                ? "sm:col-span-2"
                                                : ""
                                        }
                                    >
                                        <label
                                            htmlFor="weight"
                                            className={
                                                labelClass
                                            }
                                        >
                                            Weight
                                            <span className="ml-1 font-normal text-muted">
                                                · kg
                                            </span>
                                        </label>

                                        <input
                                            id="weight"
                                            type="number"
                                            min={0}
                                            step="0.1"
                                            value={
                                                form.weightKg
                                            }
                                            onChange={(
                                                e,
                                            ) =>
                                                handleChange(
                                                    "weightKg",
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                            className={
                                                inputClass
                                            }
                                        />
                                    </div>
                                </div>

                                {/* STOCK STATUS */}
                                <div
                                    className={`
                                        flex flex-col gap-3
                                        rounded-xl border px-4 py-3
                                        sm:flex-row sm:items-center sm:justify-between
                                        ${isInStock
                                            ? "border-emerald-500/20 bg-emerald-500/5"
                                            : "border-danger-bg bg-danger-bg/40"
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`
                                                h-2.5 w-2.5 shrink-0 rounded-full
                                                ${isInStock
                                                    ? "bg-emerald-500"
                                                    : "bg-red-500"
                                                }
                                            `}
                                        />

                                        <div>
                                            <p
                                                className={`
                                                    text-sm font-semibold
                                                    ${isInStock
                                                        ? "text-emerald-600 dark:text-emerald-400"
                                                        : "text-danger-text"
                                                    }
                                                `}
                                            >
                                                {isInStock
                                                    ? "In Stock"
                                                    : "Out of Stock"}
                                            </p>

                                            <p className="mt-0.5 text-xs text-muted">
                                                {hasVariants
                                                    ? `${variantCount} configured variant${variantCount ===
                                                        1
                                                        ? ""
                                                        : "s"
                                                    }`
                                                    : "Product inventory"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-left sm:text-right">
                                        <p className="text-lg font-bold text-primary">
                                            {totalStock}
                                        </p>

                                        <p className="text-[10px] uppercase tracking-wide text-muted">
                                            units
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ==================================================
                            SPECIFICATIONS
                        ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-default bg-surface">
                            <button
                                type="button"
                                onClick={() =>
                                    setSpecsOpen(
                                        (current) =>
                                            !current,
                                    )
                                }
                                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-hover sm:px-6"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-muted">
                                        <Settings2 className="h-4 w-4 text-primary" />
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-base font-semibold text-primary">
                                                Specifications
                                            </h2>

                                            {completedSpecs >
                                                0 && (
                                                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                                                        {
                                                            completedSpecs
                                                        }
                                                    </span>
                                                )}
                                        </div>

                                        <p className="mt-0.5 text-xs text-muted">
                                            Add details like brand, material,
                                            RAM, dimensions and more.
                                        </p>
                                    </div>
                                </div>

                                <ChevronDown
                                    className={`
                                        h-5 w-5 shrink-0
                                        text-secondary
                                        transition-transform
                                        duration-200
                                        ${specsOpen
                                            ? "rotate-180"
                                            : ""
                                        }
                                    `}
                                />
                            </button>

                            {specsOpen && (
                                <div className="border-t border-default p-5 sm:p-6">
                                    {specs.length ===
                                        0 ? (
                                        <div className="rounded-xl border border-dashed border-default bg-surface-muted/50 p-6 text-center">
                                            <Settings2 className="mx-auto h-7 w-7 text-muted" />

                                            <p className="mt-3 text-sm font-medium text-primary">
                                                No specifications yet
                                            </p>

                                            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted">
                                                Add useful product details to help
                                                customers make a buying decision.
                                            </p>

                                            <button
                                                type="button"
                                                onClick={
                                                    addSpecRow
                                                }
                                                className="
                                                    mt-4 inline-flex
                                                    items-center gap-2
                                                    rounded-lg
                                                    bg-accent
                                                    px-3.5 py-2
                                                    text-xs font-semibold
                                                    text-accent-foreground
                                                    transition-opacity
                                                    hover:opacity-90
                                                "
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Add specification
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {specs.map(
                                                (
                                                    spec,
                                                    index,
                                                ) => (
                                                    <div
                                                        key={
                                                            spec.key
                                                        }
                                                        className="group grid gap-2 rounded-xl border border-default bg-surface-muted/40 p-3 sm:grid-cols-[0.8fr_1fr_auto] sm:items-center"
                                                    >
                                                        <input
                                                            type="text"
                                                            value={
                                                                spec.label
                                                            }
                                                            onChange={(
                                                                e,
                                                            ) =>
                                                                updateSpecRow(
                                                                    spec.key,
                                                                    "label",
                                                                    e
                                                                        .target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Label e.g. Brand"
                                                            className={
                                                                smallInputClass
                                                            }
                                                        />

                                                        <input
                                                            type="text"
                                                            value={
                                                                spec.value
                                                            }
                                                            onChange={(
                                                                e,
                                                            ) =>
                                                                updateSpecRow(
                                                                    spec.key,
                                                                    "value",
                                                                    e
                                                                        .target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Value e.g. Nike"
                                                            className={
                                                                smallInputClass
                                                            }
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeSpecRow(
                                                                    spec.key,
                                                                )
                                                            }
                                                            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-bg hover:text-danger-text"
                                                            aria-label={`Remove specification ${index +
                                                                1
                                                                }`}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ),
                                            )}

                                            <button
                                                type="button"
                                                onClick={
                                                    addSpecRow
                                                }
                                                className="
                                                    flex w-full
                                                    items-center
                                                    justify-center
                                                    gap-2 rounded-xl
                                                    border border-dashed
                                                    border-default
                                                    py-3
                                                    text-sm font-medium
                                                    text-secondary
                                                    transition-colors
                                                    hover:bg-surface-hover
                                                    hover:text-primary
                                                "
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add another specification
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* ==================================================
                            VARIANTS
                        ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-default bg-surface">
                            <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-muted">
                                        <Store className="h-4 w-4 text-primary" />
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-base font-semibold text-primary">
                                                Product options
                                            </h2>

                                            {variantCount >
                                                0 && (
                                                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                                                        {
                                                            variantCount
                                                        }{" "}
                                                        options
                                                    </span>
                                                )}
                                        </div>

                                        <p className="mt-0.5 text-xs text-muted">
                                            Sell different sizes, colors or
                                            combinations.
                                        </p>
                                    </div>
                                </div>

                                <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={
                                            hasVariants
                                        }
                                        onChange={(
                                            e,
                                        ) =>
                                            handleToggleVariants(
                                                e.target
                                                    .checked,
                                            )
                                        }
                                        className="peer sr-only"
                                    />

                                    <span className="h-6 w-11 rounded-full bg-surface-muted ring-1 ring-inset ring-default transition-colors peer-checked:bg-accent" />

                                    <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface shadow-sm transition-transform peer-checked:translate-x-5" />
                                </label>
                            </div>

                            {hasVariants && (
                                <div className="border-t border-default">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setVariantsOpen(
                                                (current) =>
                                                    !current,
                                            )
                                        }
                                        className="flex w-full items-center justify-between px-5 py-3 text-left text-xs font-medium text-secondary hover:bg-surface-hover sm:px-6"
                                    >
                                        <span>
                                            {variantCount >
                                                0
                                                ? `${variantCount} variant ${variantCount ===
                                                    1
                                                    ? "option"
                                                    : "options"
                                                } configured`
                                                : "Configure your variants"}
                                        </span>

                                        <ChevronDown
                                            className={`
                                                h-4 w-4
                                                transition-transform
                                                ${variantsOpen
                                                    ? "rotate-180"
                                                    : ""
                                                }
                                            `}
                                        />
                                    </button>

                                    {variantsOpen && (
                                        <div className="space-y-4 p-5 sm:p-6">
                                            <div className="rounded-xl bg-accent/5 px-4 py-3 text-xs leading-5 text-secondary">
                                                Add one row for each
                                                combination you actually sell.
                                                Each variant has its own stock,
                                                price and images.
                                            </div>

                                            {variants.map(
                                                (
                                                    variant,
                                                    index,
                                                ) => {
                                                    const variantStock =
                                                        Number(
                                                            variant.stock,
                                                        );

                                                    const variantInStock =
                                                        Number.isFinite(
                                                            variantStock,
                                                        ) &&
                                                        variantStock >
                                                        0;

                                                    return (
                                                        <div
                                                            key={
                                                                variant.key
                                                            }
                                                            className="overflow-hidden rounded-2xl border border-default bg-surface-muted/40"
                                                        >
                                                            <div className="flex flex-col gap-3 border-b border-default px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                                                <div>
                                                                    <span className="text-xs font-bold text-primary">
                                                                        Option{" "}
                                                                        {index +
                                                                            1}
                                                                    </span>

                                                                    <p className="mt-0.5 text-[11px] text-muted">
                                                                        {variant.color ||
                                                                            "No color"}{" "}
                                                                        {variant.color &&
                                                                            variant.size
                                                                            ? " / "
                                                                            : ""}
                                                                        {variant.size ||
                                                                            "No size"}
                                                                    </p>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <span
                                                                        className={`
                                                                            rounded-full px-2 py-1
                                                                            text-[10px] font-semibold
                                                                            ${variantInStock
                                                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                                                : "bg-danger-bg text-danger-text"
                                                                            }
                                                                        `}
                                                                    >
                                                                        {variantInStock
                                                                            ? `${variantStock} in stock`
                                                                            : "Out of stock"}
                                                                    </span>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            removeVariantRow(
                                                                                variant.key,
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-danger-text transition-colors hover:bg-danger-bg"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4 p-4">
                                                                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                                                                    <div>
                                                                        <label className="mb-1.5 block text-xs font-medium text-secondary">
                                                                            Color
                                                                        </label>

                                                                        <input
                                                                            type="text"
                                                                            value={
                                                                                variant.color
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                updateVariantRow(
                                                                                    variant.key,
                                                                                    "color",
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            placeholder="Red"
                                                                            className={
                                                                                smallInputClass
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="mb-1.5 block text-xs font-medium text-secondary">
                                                                            Size
                                                                        </label>

                                                                        <input
                                                                            type="text"
                                                                            value={
                                                                                variant.size
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                updateVariantRow(
                                                                                    variant.key,
                                                                                    "size",
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            placeholder="M"
                                                                            className={
                                                                                smallInputClass
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="mb-1.5 block text-xs font-medium text-secondary">
                                                                            Stock *
                                                                        </label>

                                                                        <input
                                                                            type="number"
                                                                            min={
                                                                                0
                                                                            }
                                                                            value={
                                                                                variant.stock
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                updateVariantRow(
                                                                                    variant.key,
                                                                                    "stock",
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            className={
                                                                                smallInputClass
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="mb-1.5 block text-xs font-medium text-secondary">
                                                                            SKU
                                                                        </label>

                                                                        <input
                                                                            type="text"
                                                                            value={
                                                                                variant.sku
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                updateVariantRow(
                                                                                    variant.key,
                                                                                    "sku",
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            placeholder="Optional"
                                                                            className={
                                                                                smallInputClass
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="grid gap-3 sm:grid-cols-2">
                                                                    <div>
                                                                        <label className="mb-1.5 block text-xs font-medium text-secondary">
                                                                            Price override
                                                                        </label>

                                                                        <input
                                                                            type="number"
                                                                            min={
                                                                                0
                                                                            }
                                                                            value={
                                                                                variant.price
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                updateVariantRow(
                                                                                    variant.key,
                                                                                    "price",
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            placeholder={
                                                                                form.price
                                                                                    ? `Default ₹${form.price}`
                                                                                    : "Optional"
                                                                            }
                                                                            className={
                                                                                smallInputClass
                                                                            }
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="mb-1.5 block text-xs font-medium text-secondary">
                                                                            Discount price
                                                                        </label>

                                                                        <input
                                                                            type="number"
                                                                            min={
                                                                                0
                                                                            }
                                                                            value={
                                                                                variant.discountPrice
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                updateVariantRow(
                                                                                    variant.key,
                                                                                    "discountPrice",
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            placeholder="Optional"
                                                                            className={
                                                                                smallInputClass
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <label className="mb-2 block text-xs font-medium text-secondary">
                                                                        Variant images
                                                                        <span className="ml-1 font-normal text-muted">
                                                                            · optional
                                                                        </span>
                                                                    </label>

                                                                    <MultiImageUploadField
                                                                        label=""
                                                                        value={
                                                                            variant.images
                                                                        }
                                                                        onChange={(
                                                                            imgs,
                                                                        ) =>
                                                                            updateVariantImages(
                                                                                variant.key,
                                                                                imgs,
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                },
                                            )}

                                            <button
                                                type="button"
                                                onClick={
                                                    addVariantRow
                                                }
                                                className="
                                                    flex w-full
                                                    items-center
                                                    justify-center
                                                    gap-2 rounded-xl
                                                    border border-dashed
                                                    border-default
                                                    py-3
                                                    text-sm font-medium
                                                    text-secondary
                                                    transition-colors
                                                    hover:bg-surface-hover
                                                    hover:text-primary
                                                "
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add another option
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* MOBILE ACTIONS */}

                        <div className="sticky bottom-0 -mx-4 flex flex-col-reverse gap-3 border-t border-default bg-surface-muted/95 px-4 py-3 backdrop-blur sm:flex-row sm:justify-end sm:border-none sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none lg:hidden">
                            <button
                                type="button"
                                onClick={() =>
                                    router.back()
                                }
                                className="
                                    rounded-xl border
                                    border-default
                                    bg-surface
                                    px-5 py-3
                                    text-sm font-semibold
                                    text-primary
                                    transition-colors
                                    hover:bg-surface-hover
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="
                                    inline-flex items-center
                                    justify-center gap-2
                                    rounded-xl
                                    bg-accent px-5 py-3
                                    text-sm font-bold
                                    text-accent-foreground
                                    transition-all
                                    hover:opacity-90
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >
                                <Save className="h-4 w-4" />

                                {syncingVariants
                                    ? "Saving options..."
                                    : mutating
                                        ? "Saving..."
                                        : isEditMode
                                            ? "Save changes"
                                            : "Create product"}
                            </button>
                        </div>
                    </div>

                    {/* ==================================================
                        RIGHT SIDEBAR
                    ================================================== */}

                    <aside className="hidden lg:block">
                        <div className="sticky top-24 space-y-4">
                            <div className="overflow-hidden rounded-2xl border border-default bg-surface">
                                <div className="border-b border-default px-5 py-4">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-accent" />

                                        <h3 className="text-sm font-semibold text-primary">
                                            Listing summary
                                        </h3>
                                    </div>
                                </div>

                                <div className="space-y-4 p-5">
                                    <div>
                                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                                            Product
                                        </p>

                                        <p className="mt-1 truncate text-sm font-semibold text-primary">
                                            {form.name ||
                                                "Your product name"}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-surface-muted p-3">
                                            <p className="text-[10px] uppercase tracking-wide text-muted">
                                                Price
                                            </p>

                                            <p className="mt-1 text-sm font-bold text-primary">
                                                ₹
                                                {form.price ||
                                                    "0"}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-surface-muted p-3">
                                            <p className="text-[10px] uppercase tracking-wide text-muted">
                                                Images
                                            </p>

                                            <p className="mt-1 text-sm font-bold text-primary">
                                                {
                                                    imageCount
                                                }{" "}
                                                / 5
                                            </p>
                                        </div>
                                    </div>

                                    {/* STOCK STATUS */}
                                    <div
                                        className={`
                                            rounded-xl border p-3
                                            ${isInStock
                                                ? "border-emerald-500/20 bg-emerald-500/5"
                                                : "border-danger-bg bg-danger-bg/40"
                                            }
                                        `}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wide text-muted">
                                                    Inventory
                                                </p>

                                                <p
                                                    className={`
                                                        mt-1 text-sm font-bold
                                                        ${isInStock
                                                            ? "text-emerald-600 dark:text-emerald-400"
                                                            : "text-danger-text"
                                                        }
                                                    `}
                                                >
                                                    {isInStock
                                                        ? "In Stock"
                                                        : "Out of Stock"}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-lg font-bold text-primary">
                                                    {
                                                        totalStock
                                                    }
                                                </p>

                                                <p className="text-[10px] text-muted">
                                                    units
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-default p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-secondary">
                                                Category
                                            </span>

                                            <span className="max-w-[150px] truncate text-xs font-semibold text-primary">
                                                {categories.find(
                                                    (
                                                        c,
                                                    ) =>
                                                        c.slug ===
                                                        form.category,
                                                )?.name ||
                                                    "Not selected"}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between border-t border-default pt-3">
                                            <span className="text-xs text-secondary">
                                                Options
                                            </span>

                                            <span className="text-xs font-semibold text-primary">
                                                {hasVariants
                                                    ? `${variantCount} variants`
                                                    : "Simple product"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Seller tips */}

                            <div className="rounded-2xl border border-default bg-surface-muted p-5">
                                <div className="flex items-center gap-2">
                                    <CircleHelp className="h-4 w-4 text-accent" />

                                    <h3 className="text-sm font-semibold text-primary">
                                        Listing tips
                                    </h3>
                                </div>

                                <ul className="mt-4 space-y-3 text-xs leading-5 text-secondary">
                                    <li className="flex gap-2">
                                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                                        Use a clear, descriptive product title.
                                    </li>

                                    <li className="flex gap-2">
                                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                                        Add multiple product images from useful angles.
                                    </li>

                                    <li className="flex gap-2">
                                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                                        Add specifications that help buyers compare products.
                                    </li>

                                    <li className="flex gap-2">
                                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                                        Keep stock and variant information accurate.
                                    </li>
                                </ul>
                            </div>

                            {/* Desktop actions */}

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        router.back()
                                    }
                                    className="
                                        flex-1 rounded-xl
                                        border border-default
                                        bg-surface px-4 py-3
                                        text-sm font-semibold
                                        text-primary
                                        transition-colors
                                        hover:bg-surface-hover
                                    "
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="
                                        inline-flex flex-[1.4]
                                        items-center
                                        justify-center gap-2
                                        rounded-xl
                                        bg-accent px-4 py-3
                                        text-sm font-bold
                                        text-accent-foreground
                                        transition-all
                                        hover:opacity-90
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    <Save className="h-4 w-4" />

                                    {syncingVariants
                                        ? "Saving options..."
                                        : mutating
                                            ? "Saving..."
                                            : isEditMode
                                                ? "Save changes"
                                                : "Create product"}
                                </button>
                            </div>
                        </div>
                    </aside>
                </form>
            </div>
        </main>
    );
}