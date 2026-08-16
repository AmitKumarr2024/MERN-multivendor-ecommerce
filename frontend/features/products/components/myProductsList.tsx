"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    deleteProduct,
    fetchMyProducts,
    toggleProductActive,
    clearProductError,
    clearProductMessage,
} from "../store/Productslice";
import {
    selectMyProducts,
    selectMyProductsLoading,
    selectProductError,
    selectProductSuccessMessage,
} from "../store/Productselectors";
import { formatPrice, getCategoryInfo } from "../utils/productHelpers";
import type { Product } from "../types/product.types";

export default function MyProductsList() {
    const dispatch = useAppDispatch();

    const products = useAppSelector(selectMyProducts);
    const loading = useAppSelector(selectMyProductsLoading);
    const error = useAppSelector(selectProductError);
    const successMessage = useAppSelector(selectProductSuccessMessage);

    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchMyProducts());

        return () => {
            dispatch(clearProductError());
            dispatch(clearProductMessage());
        };
    }, [dispatch]);

    const handleToggleActive = (id: string) => {
        dispatch(toggleProductActive(id));
    };

    const handleDelete = (id: string) => {
        if (confirmDeleteId !== id) {
            setConfirmDeleteId(id);
            return;
        }

        dispatch(deleteProduct(id));
        setConfirmDeleteId(null);
    };

    return (
        <div className="mx-auto max-w-6xl space-y-4 p-4 sm:space-y-6 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-primary sm:text-2xl">
                        My products
                    </h1>

                    <p className="text-sm text-secondary">
                        Manage listings, stock, and visibility.
                    </p>
                </div>

                <Link
                    href="/seller/products/new"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground shadow-sm transition-opacity hover:opacity-90"
                >
                    <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                    >
                        <path d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 0 1 0-2h5V4a1 1 0 0 1 1-1Z" />
                    </svg>
                    Add product
                </Link>
            </div>

            {error ? (
                <div className="rounded-lg bg-danger-bg px-4 py-3 text-sm text-danger-text">
                    {error}
                </div>
            ) : null}

            {successMessage ? (
                <div className="rounded-lg bg-success-bg px-4 py-3 text-sm text-success-text">
                    {successMessage}
                </div>
            ) : null}

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-20 animate-pulse rounded-2xl border border-default bg-surface-muted"
                        />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-default bg-surface py-16 text-center">
                    <p className="text-sm text-secondary">
                        You haven&apos;t listed any products yet.
                    </p>

                    <Link
                        href="/seller/products/new"
                        className="mt-3 text-sm font-medium text-info-text transition-opacity hover:opacity-80"
                    >
                        Add your first product →
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {products.map((product) => (
                        <ProductRow
                            key={product._id}
                            product={product}
                            confirming={confirmDeleteId === product._id}
                            onToggleActive={() =>
                                handleToggleActive(product._id)
                            }
                            onDelete={() => handleDelete(product._id)}
                            onCancelDelete={() =>
                                setConfirmDeleteId(null)
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface ProductRowProps {
    product: Product;
    confirming: boolean;
    onToggleActive: () => void;
    onDelete: () => void;
    onCancelDelete: () => void;
}

function ProductRow({
    product,
    confirming,
    onToggleActive,
    onDelete,
    onCancelDelete,
}: ProductRowProps) {
    const category = getCategoryInfo(product);
    const image = product.images?.[0];

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-default bg-surface p-3 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:gap-4 sm:p-4">
            <div className="flex flex-1 items-center gap-3 sm:gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                    {image ? (
                        <Image
                            src={image}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-muted">
                            No image
                        </div>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-primary sm:text-base">
                        {product.name}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-muted">
                        {category?.name ?? "Uncategorized"}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-primary">
                            {formatPrice(product.price)}
                        </span>

                        <span
                            className={`text-xs font-medium ${product.stock === 0
                                    ? "text-danger-text"
                                    : product.stock <= 5
                                        ? "text-warning-text"
                                        : "text-secondary"
                                }`}
                        >
                            {product.stock} in stock
                        </span>

                        {!product.isActive && (
                            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-secondary">
                                Hidden
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                <Link
                    href={`/seller/products/${product._id}/edit`}
                    className="rounded-lg border border-default px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-surface-hover sm:text-sm"
                >
                    Edit
                </Link>

                <button
                    type="button"
                    onClick={onToggleActive}
                    className="rounded-lg border border-default px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-surface-hover sm:text-sm"
                >
                    {product.isActive ? "Hide" : "Show"}
                </button>

                {confirming ? (
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={onDelete}
                            className="rounded-lg bg-danger-solid px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 sm:text-sm"
                        >
                            Confirm
                        </button>

                        <button
                            type="button"
                            onClick={onCancelDelete}
                            className="rounded-lg border border-default px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:bg-surface-hover sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={onDelete}
                        className="rounded-lg border border-danger-bg px-3 py-1.5 text-xs font-medium text-danger-text transition-colors hover:bg-danger-bg sm:text-sm"
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
}