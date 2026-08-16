"use client";

/**
 * =========================================================
 * ADMIN CATEGORIES
 * =========================================================
 *
 * Purpose:
 * Admin-only category management UI.
 *
 * Responsibilities:
 * - Fetch categories
 * - Create category
 * - Update category
 * - Delete category
 * - Select category from tree
 * - Display category hierarchy
 * - Manage active / inactive status
 *
 * Redux:
 * - fetchCategories
 * - createCategory
 * - updateCategory
 * - deleteCategory
 * - setSelectedCategory
 * - clearCategoryError
 * - clearCategoryMessage
 *
 * Components:
 * - CategoryForm
 * - CategoryTree
 *
 * Route:
 * /admin/categories
 *
 * IMPORTANT:
 * The route itself should be protected with:
 *
 * RequireRole allow={["admin"]}
 *
 * or the equivalent admin route guard used elsewhere
 * in the application.
 * =========================================================
 */

import { useEffect, useMemo, useState } from "react";
import {
    Edit3,
    FolderTree,
    Plus,
    RefreshCw,
    Trash2,
    X,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
    clearCategoryError,
    clearCategoryMessage,
    createCategory,
    deleteCategory,
    fetchCategories,
    setSelectedCategory,
    updateCategory,
} from "@/features/category";

import {
    selectCategories,
    selectCategoryError,
    selectCategoryLoading,
    selectCategorySuccessMessage,
    selectSelectedCategory,
} from "@/features/category";

import type {
    Category,
    CreateCategoryPayload,
    UpdateCategoryPayload,
} from "@/features/category";

import CategoryForm from "@/features/category/components/CategoryForm";
import CategoryTree from "@/features/category/components/CategoryTree";

/* =========================================================
   COMPONENT
========================================================= */

export default function AdminCategories() {
    const dispatch = useAppDispatch();

    /* =====================================================
       REDUX STATE
    ===================================================== */

    const categories = useAppSelector(selectCategories);

    const selectedCategory = useAppSelector(
        selectSelectedCategory,
    );

    const loading = useAppSelector(
        selectCategoryLoading,
    );

    const error = useAppSelector(
        selectCategoryError,
    );

    const successMessage = useAppSelector(
        selectCategorySuccessMessage,
    );

    /* =====================================================
       LOCAL UI STATE
    ===================================================== */

    const [showForm, setShowForm] =
        useState(false);

    const [editingCategory, setEditingCategory] =
        useState<Category | null>(null);

    const [deletingCategoryId, setDeletingCategoryId] =
        useState<string | null>(null);

    /* =====================================================
       FETCH CATEGORIES
    ===================================================== */

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    /* =====================================================
       AUTO CLEAR SUCCESS MESSAGE
    ===================================================== */

    useEffect(() => {
        if (!successMessage) {
            return;
        }

        const timer = window.setTimeout(() => {
            dispatch(clearCategoryMessage());
        }, 3000);

        return () => {
            window.clearTimeout(timer);
        };
    }, [successMessage, dispatch]);

    /* =====================================================
       CATEGORY COUNTS
    ===================================================== */

    const activeCount = useMemo(
        () =>
            categories.filter(
                (category) => category.isActive,
            ).length,
        [categories],
    );

    const inactiveCount = useMemo(
        () =>
            categories.filter(
                (category) => !category.isActive,
            ).length,
        [categories],
    );

    const rootCount = useMemo(
        () =>
            categories.filter(
                (category) => !category.parent,
            ).length,
        [categories],
    );

    /* =====================================================
       CREATE
    ===================================================== */

    const handleCreate = () => {
        dispatch(setSelectedCategory(null));
        setEditingCategory(null);
        setShowForm(true);
        dispatch(clearCategoryError());
        dispatch(clearCategoryMessage());
    };

    /* =====================================================
       EDIT
    ===================================================== */

    const handleEdit = (category: Category) => {
        dispatch(setSelectedCategory(category));
        setEditingCategory(category);
        setShowForm(true);
        dispatch(clearCategoryError());
        dispatch(clearCategoryMessage());
    };

    /* =====================================================
       CLOSE FORM
    ===================================================== */

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingCategory(null);
        dispatch(setSelectedCategory(null));
        dispatch(clearCategoryError());
        dispatch(clearCategoryMessage());
    };

    /* =====================================================
       CREATE / UPDATE SUBMIT
    ===================================================== */

    const handleSubmit = async (
        values: CreateCategoryPayload,
    ) => {
        if (editingCategory) {
            const payload: UpdateCategoryPayload = {
                id: editingCategory._id,
                ...values,
                isActive:
                    editingCategory.isActive,
            };

            const result = await dispatch(
                updateCategory(payload),
            );

            if (
                updateCategory.fulfilled.match(
                    result,
                )
            ) {
                setShowForm(false);
                setEditingCategory(null);
                dispatch(setSelectedCategory(null));
            }

            return;
        }

        const result = await dispatch(
            createCategory(values),
        );

        if (
            createCategory.fulfilled.match(
                result,
            )
        ) {
            setShowForm(false);
            setEditingCategory(null);
        }
    };

    /* =====================================================
       DELETE
    ===================================================== */

    const handleDelete = async (
        category: Category,
    ) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${category.name}"?`,
        );

        if (!confirmed) {
            return;
        }

        setDeletingCategoryId(category._id);

        const result = await dispatch(
            deleteCategory(category._id),
        );

        if (
            deleteCategory.fulfilled.match(
                result,
            )
        ) {
            if (
                selectedCategory?._id ===
                category._id
            ) {
                dispatch(
                    setSelectedCategory(null),
                );
            }

            if (
                editingCategory?._id ===
                category._id
            ) {
                setEditingCategory(null);
                setShowForm(false);
            }
        }

        setDeletingCategoryId(null);
    };

    /* =====================================================
       SELECT FROM TREE
    ===================================================== */

    const handleSelectCategory = (
        category: Category,
    ) => {
        dispatch(
            setSelectedCategory(category),
        );
    };

    /* =====================================================
       REFRESH
    ===================================================== */

    const handleRefresh = () => {
        dispatch(clearCategoryError());
        dispatch(clearCategoryMessage());
        dispatch(fetchCategories());
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <section className="space-y-6">
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <FolderTree
                                size={22}
                            />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-primary sm:text-3xl">
                                Category Management
                            </h1>

                            <p className="mt-1 text-sm text-secondary">
                                Create and manage
                                your marketplace
                                categories.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-default bg-surface px-4 py-2 text-sm font-medium text-primary transition hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={handleCreate}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
                    >
                        <Plus size={17} />

                        Create Category
                    </button>
                </div>
            </div>

            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {successMessage && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400">
                    {successMessage}
                </div>
            )}

            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (
                <div className="flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() =>
                            dispatch(
                                clearCategoryError(),
                            )
                        }
                        className="shrink-0 rounded p-1 transition hover:bg-red-100 dark:hover:bg-red-900/40"
                        aria-label="Dismiss error"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-default bg-surface p-5">
                    <p className="text-sm text-secondary">
                        Total Categories
                    </p>

                    <p className="mt-2 text-2xl font-bold text-primary">
                        {categories.length}
                    </p>
                </div>

                <div className="rounded-xl border border-default bg-surface p-5">
                    <p className="text-sm text-secondary">
                        Active
                    </p>

                    <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                        {activeCount}
                    </p>
                </div>

                <div className="rounded-xl border border-default bg-surface p-5">
                    <p className="text-sm text-secondary">
                        Inactive
                    </p>

                    <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
                        {inactiveCount}
                    </p>
                </div>

                <div className="rounded-xl border border-default bg-surface p-5">
                    <p className="text-sm text-secondary">
                        Root Categories
                    </p>

                    <p className="mt-2 text-2xl font-bold text-primary">
                        {rootCount}
                    </p>
                </div>
            </div>

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                {/* =================================================
                    CATEGORY TREE
                ================================================= */}

                <div>
                    <CategoryTree
                        categories={categories}
                        selectedCategoryId={
                            selectedCategory?._id
                        }
                        onSelect={
                            handleSelectCategory
                        }
                    />
                </div>

                {/* =================================================
                    CATEGORY TABLE
                ================================================= */}

                <div className="overflow-hidden rounded-xl border border-default bg-surface">
                    <div className="border-b border-default px-5 py-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="font-semibold text-primary">
                                    All Categories
                                </h2>

                                <p className="mt-1 text-sm text-secondary">
                                    Manage category
                                    information and
                                    status.
                                </p>
                            </div>

                            <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-secondary">
                                {categories.length}{" "}
                                total
                            </span>
                        </div>
                    </div>

                    {loading &&
                        categories.length === 0 ? (
                        <div className="space-y-3 p-5">
                            {Array.from({
                                length: 5,
                            }).map(
                                (_, index) => (
                                    <div
                                        key={
                                            index
                                        }
                                        className="h-16 animate-pulse rounded-lg bg-surface-muted"
                                    />
                                ),
                            )}
                        </div>
                    ) : categories.length ===
                        0 ? (
                        <div className="px-6 py-14 text-center">
                            <FolderTree
                                size={40}
                                className="mx-auto text-muted"
                            />

                            <h3 className="mt-4 font-semibold text-primary">
                                No categories
                                found
                            </h3>

                            <p className="mt-1 text-sm text-secondary">
                                Create your
                                first category
                                to get started.
                            </p>

                            <button
                                type="button"
                                onClick={
                                    handleCreate
                                }
                                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
                            >
                                <Plus
                                    size={16}
                                />

                                Create Category
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-190 text-left">
                                <thead className="border-b border-default bg-surface-muted">
                                    <tr>
                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-secondary">
                                            Category
                                        </th>

                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-secondary">
                                            Parent
                                        </th>

                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-secondary">
                                            Slug
                                        </th>

                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-secondary">
                                            Status
                                        </th>

                                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-secondary">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-default">
                                    {categories.map(
                                        (
                                            category,
                                        ) => (
                                            <tr
                                                key={
                                                    category._id
                                                }
                                                className={`transition hover:bg-surface-hover ${selectedCategory?._id ===
                                                        category._id
                                                        ? "bg-blue-50/70 dark:bg-blue-950/20"
                                                        : ""
                                                    }`}
                                            >
                                                {/* CATEGORY */}

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {category.image ? (
                                                            <img
                                                                src={
                                                                    category.image
                                                                }
                                                                alt={
                                                                    category.name
                                                                }
                                                                className="h-10 w-10 rounded-lg border border-default object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-secondary">
                                                                <FolderTree
                                                                    size={
                                                                        18
                                                                    }
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium text-primary">
                                                                {
                                                                    category.name
                                                                }
                                                            </p>

                                                            <p className="text-xs text-secondary">
                                                                {
                                                                    category._id
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* PARENT */}

                                                <td className="px-5 py-4">
                                                    {category
                                                        .parent ? (
                                                        <span className="text-sm text-secondary">
                                                            {
                                                                category
                                                                    .parent
                                                                    .name
                                                            }
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-muted">
                                                            Root
                                                        </span>
                                                    )}
                                                </td>

                                                {/* SLUG */}

                                                <td className="px-5 py-4">
                                                    <code className="rounded bg-surface-muted px-2 py-1 text-xs text-secondary">
                                                        /
                                                        categories/
                                                        {
                                                            category.slug
                                                        }
                                                    </code>
                                                </td>

                                                {/* STATUS */}

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${category.isActive
                                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                            }`}
                                                    >
                                                        {category.isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                </td>

                                                {/* ACTIONS */}

                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    category,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-default bg-surface px-3 py-2 text-xs font-medium text-primary transition hover:bg-surface-hover"
                                                        >
                                                            <Edit3
                                                                size={
                                                                    14
                                                                }
                                                            />

                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    category,
                                                                )
                                                            }
                                                            disabled={
                                                                deletingCategoryId ===
                                                                category._id
                                                            }
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                                                        >
                                                            <Trash2
                                                                size={
                                                                    14
                                                                }
                                                            />

                                                            {deletingCategoryId ===
                                                                category._id
                                                                ? "Deleting..."
                                                                : "Delete"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* =================================================
                SELECTED CATEGORY
            ================================================= */}

            {selectedCategory &&
                !showForm && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-900 dark:bg-blue-950/20">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
                                    Selected Category
                                </p>

                                <h3 className="mt-1 text-lg font-semibold text-primary">
                                    {
                                        selectedCategory.name
                                    }
                                </h3>

                                <p className="mt-1 text-sm text-secondary">
                                    /
                                    categories/
                                    {
                                        selectedCategory.slug
                                    }
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleEdit(
                                            selectedCategory,
                                        )
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
                                >
                                    <Edit3
                                        size={16}
                                    />

                                    Edit Category
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDelete(
                                            selectedCategory,
                                        )
                                    }
                                    disabled={
                                        deletingCategoryId ===
                                        selectedCategory._id
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
                                >
                                    <Trash2
                                        size={16}
                                    />

                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            {/* =================================================
                CREATE / EDIT FORM
            ================================================= */}

            {showForm && (
                <div className="rounded-xl border border-default bg-surface">
                    <div className="flex items-center justify-between border-b border-default px-5 py-4">
                        <div>
                            <h2 className="font-semibold text-primary">
                                {editingCategory
                                    ? "Edit Category"
                                    : "Create Category"}
                            </h2>

                            <p className="mt-1 text-sm text-secondary">
                                {editingCategory
                                    ? "Update the category information below."
                                    : "Add a new marketplace category."}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={
                                handleCloseForm
                            }
                            className="rounded-lg p-2 text-secondary transition hover:bg-surface-hover hover:text-primary"
                            aria-label="Close form"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-5">
                        <CategoryForm
                            loading={loading}
                            initialValues={
                                editingCategory ??
                                undefined
                            }
                            categories={
                                categories
                            }
                            onSubmit={
                                handleSubmit
                            }
                        />
                    </div>
                </div>
            )}
        </section>
    );
}