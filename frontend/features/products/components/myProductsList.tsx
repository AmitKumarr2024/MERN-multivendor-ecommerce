"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    AlertCircle,
    Archive,
    CheckCircle2,
    Edit3,
    Eye,
    EyeOff,
    Grid2X2,
    List,
    MoreHorizontal,
    Package,
    Plus,
    Search,
    ShoppingBag,
    Trash2,
    X,
} from "lucide-react";

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

import {
    formatPrice,
    getCategoryInfo,
} from "../utils/productHelpers";

import type { Product } from "../types/product.types";

/* =========================================================
   TYPES
========================================================= */

type ProductFilter =
    | "all"
    | "active"
    | "hidden"
    | "out_of_stock";

type ProductView = "list" | "grid";

/* =========================================================
   MAIN
========================================================= */

export default function MyProductsList() {
    const dispatch = useAppDispatch();

    const products = useAppSelector(selectMyProducts);
    const loading = useAppSelector(
        selectMyProductsLoading,
    );
    const error = useAppSelector(
        selectProductError,
    );
    const successMessage = useAppSelector(
        selectProductSuccessMessage,
    );

    const [confirmDeleteId, setConfirmDeleteId] =
        useState<string | null>(null);

    const [search, setSearch] = useState("");

    const [filter, setFilter] =
        useState<ProductFilter>("all");

    const [view, setView] =
        useState<ProductView>("list");

    /* =====================================================
       FETCH
    ===================================================== */

    useEffect(() => {
        dispatch(fetchMyProducts());

        return () => {
            dispatch(clearProductError());
            dispatch(clearProductMessage());
        };
    }, [dispatch]);

    /* =====================================================
       RESTORE VIEW PREFERENCE
    ===================================================== */

    useEffect(() => {
        const savedView =
            localStorage.getItem(
                "sellerProductsView",
            );

        if (
            savedView === "list" ||
            savedView === "grid"
        ) {
            setView(savedView);
        }
    }, []);

    const changeView = (
        nextView: ProductView,
    ) => {
        setView(nextView);

        localStorage.setItem(
            "sellerProductsView",
            nextView,
        );
    };

    /* =====================================================
       COUNTS
    ===================================================== */

    const activeCount = products.filter(
        (product) =>
            product.isActive &&
            product.stock > 0,
    ).length;

    const hiddenCount = products.filter(
        (product) =>
            !product.isActive,
    ).length;

    const outOfStockCount = products.filter(
        (product) =>
            product.stock === 0,
    ).length;

    const lowStockCount = products.filter(
        (product) =>
            product.stock > 0 &&
            product.stock <= 5,
    ).length;

    /* =====================================================
       FILTER PRODUCTS
    ===================================================== */

    const filteredProducts = useMemo(() => {
        const normalizedSearch =
            search.trim().toLowerCase();

        return products.filter(
            (product) => {
                const matchesSearch =
                    !normalizedSearch ||
                    product.name
                        .toLowerCase()
                        .includes(
                            normalizedSearch,
                        );

                if (!matchesSearch) {
                    return false;
                }

                switch (filter) {
                    case "active":
                        return (
                            product.isActive &&
                            product.stock > 0
                        );

                    case "hidden":
                        return !product.isActive;

                    case "out_of_stock":
                        return product.stock === 0;

                    default:
                        return true;
                }
            },
        );
    }, [
        products,
        search,
        filter,
    ]);

    /* =====================================================
       ACTIONS
    ===================================================== */

    const handleToggleActive = (
        id: string,
    ) => {
        dispatch(
            toggleProductActive(id),
        );
    };

    const handleDelete = (
        id: string,
    ) => {
        if (
            confirmDeleteId !== id
        ) {
            setConfirmDeleteId(id);
            return;
        }

        dispatch(
            deleteProduct(id),
        );

        setConfirmDeleteId(null);
    };

    const clearFilters = () => {
        setSearch("");
        setFilter("all");
    };

    const hasFilters =
        search.trim().length > 0 ||
        filter !== "all";

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 pb-10 sm:px-6 sm:py-7 lg:px-8">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                                <Package className="h-5 w-5" />
                            </div>

                            <div>
                                <h1 className="text-xl font-black tracking-tight text-primary sm:text-2xl">
                                    Products
                                </h1>

                                <p className="mt-0.5 text-xs text-secondary sm:text-sm">
                                    Manage your catalog,
                                    inventory, and product
                                    visibility.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/seller/products/new"
                        className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-accent
                            px-4
                            py-2.5
                            text-sm
                            font-bold
                            text-accent-foreground
                            shadow-sm
                            transition-all
                            hover:-translate-y-0.5
                            hover:opacity-90
                        "
                    >
                        <Plus className="h-4 w-4" />
                        Add product
                    </Link>
                </header>

                {/* =================================================
                    STATS
                ================================================= */}

                <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <ProductStat
                        label="Total products"
                        value={products.length}
                        icon={
                            <ShoppingBag className="h-4 w-4" />
                        }
                    />

                    <ProductStat
                        label="Active"
                        value={activeCount}
                        icon={
                            <CheckCircle2 className="h-4 w-4" />
                        }
                        tone="success"
                    />

                    <ProductStat
                        label="Low stock"
                        value={lowStockCount}
                        icon={
                            <Archive className="h-4 w-4" />
                        }
                        tone={
                            lowStockCount > 0
                                ? "warning"
                                : "default"
                        }
                    />

                    <ProductStat
                        label="Out of stock"
                        value={outOfStockCount}
                        icon={
                            <AlertCircle className="h-4 w-4" />
                        }
                        tone={
                            outOfStockCount > 0
                                ? "danger"
                                : "default"
                        }
                    />
                </section>

                {/* =================================================
                    ALERTS
                ================================================= */}

                {error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                        <span>
                            {error}
                        </span>
                    </div>
                )}

                {successMessage && (
                    <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

                        <span>
                            {successMessage}
                        </span>
                    </div>
                )}

                {/* =================================================
                    PRODUCT MANAGEMENT PANEL
                ================================================= */}

                <section className="overflow-hidden rounded-3xl border border-default bg-surface">

                    {/* =================================================
                        TOOLBAR
                    ================================================= */}

                    <div className="border-b border-default p-4 sm:p-5">
                        <div className="flex flex-col gap-3">

                            {/* Search */}
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div className="relative w-full lg:max-w-md">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target
                                                    .value,
                                            )
                                        }
                                        placeholder="Search products..."
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-default
                                            bg-surface-muted/50
                                            py-2.5
                                            pl-10
                                            pr-4
                                            text-sm
                                            text-primary
                                            outline-none
                                            transition
                                            placeholder:text-muted
                                            focus:border-accent
                                            focus:bg-surface
                                            focus:ring-2
                                            focus:ring-accent/10
                                        "
                                    />
                                </div>

                                {/* View switch */}
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-xs text-muted">
                                        {filteredProducts.length}{" "}
                                        {filteredProducts.length ===
                                            1
                                            ? "product"
                                            : "products"}
                                    </p>

                                    <div className="flex shrink-0 items-center rounded-xl border border-default bg-surface-muted p-1">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                changeView(
                                                    "list",
                                                )
                                            }
                                            aria-label="List view"
                                            aria-pressed={
                                                view ===
                                                "list"
                                            }
                                            className={`
                                                flex
                                                h-8
                                                w-8
                                                items-center
                                                justify-center
                                                rounded-lg
                                                transition-all
                                                ${view ===
                                                    "list"
                                                    ? "bg-surface text-primary shadow-sm"
                                                    : "text-muted hover:text-primary"
                                                }
                                            `}
                                        >
                                            <List className="h-4 w-4" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                changeView(
                                                    "grid",
                                                )
                                            }
                                            aria-label="Card view"
                                            aria-pressed={
                                                view ===
                                                "grid"
                                            }
                                            className={`
                                                flex
                                                h-8
                                                w-8
                                                items-center
                                                justify-center
                                                rounded-lg
                                                transition-all
                                                ${view ===
                                                    "grid"
                                                    ? "bg-surface text-primary shadow-sm"
                                                    : "text-muted hover:text-primary"
                                                }
                                            `}
                                        >
                                            <Grid2X2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-2">
                                <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
                                    <FilterButton
                                        active={
                                            filter ===
                                            "all"
                                        }
                                        onClick={() =>
                                            setFilter(
                                                "all",
                                            )
                                        }
                                    >
                                        All
                                        <FilterCount>
                                            {
                                                products.length
                                            }
                                        </FilterCount>
                                    </FilterButton>

                                    <FilterButton
                                        active={
                                            filter ===
                                            "active"
                                        }
                                        onClick={() =>
                                            setFilter(
                                                "active",
                                            )
                                        }
                                    >
                                        Active
                                        <FilterCount>
                                            {
                                                activeCount
                                            }
                                        </FilterCount>
                                    </FilterButton>

                                    <FilterButton
                                        active={
                                            filter ===
                                            "hidden"
                                        }
                                        onClick={() =>
                                            setFilter(
                                                "hidden",
                                            )
                                        }
                                    >
                                        Hidden
                                        <FilterCount>
                                            {
                                                hiddenCount
                                            }
                                        </FilterCount>
                                    </FilterButton>

                                    <FilterButton
                                        active={
                                            filter ===
                                            "out_of_stock"
                                        }
                                        onClick={() =>
                                            setFilter(
                                                "out_of_stock",
                                            )
                                        }
                                    >
                                        Out of stock
                                        <FilterCount>
                                            {
                                                outOfStockCount
                                            }
                                        </FilterCount>
                                    </FilterButton>
                                </div>

                                {hasFilters && (
                                    <button
                                        type="button"
                                        onClick={
                                            clearFilters
                                        }
                                        className="
                                            hidden
                                            shrink-0
                                            items-center
                                            gap-1
                                            rounded-lg
                                            px-2
                                            py-1.5
                                            text-xs
                                            font-semibold
                                            text-muted
                                            hover:bg-surface-hover
                                            hover:text-primary
                                            sm:inline-flex
                                        "
                                    >
                                        <X className="h-3.5 w-3.5" />
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        PRODUCTS
                    ================================================= */}

                    <div className="p-3 sm:p-4">
                        {loading ? (
                            <ProductSkeleton
                                view={view}
                            />
                        ) : filteredProducts.length ===
                            0 ? (
                            <EmptyProducts
                                hasFilters={
                                    hasFilters
                                }
                                onClear={
                                    clearFilters
                                }
                            />
                        ) : view === "list" ? (
                            <div className="space-y-3">
                                {filteredProducts.map(
                                    (
                                        product,
                                    ) => (
                                        <ProductListItem
                                            key={
                                                product._id
                                            }
                                            product={
                                                product
                                            }
                                            confirming={
                                                confirmDeleteId ===
                                                product._id
                                            }
                                            onToggleActive={() =>
                                                handleToggleActive(
                                                    product._id,
                                                )
                                            }
                                            onDelete={() =>
                                                handleDelete(
                                                    product._id,
                                                )
                                            }
                                            onCancelDelete={() =>
                                                setConfirmDeleteId(
                                                    null,
                                                )
                                            }
                                        />
                                    ),
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {filteredProducts.map(
                                    (
                                        product,
                                    ) => (
                                        <ProductGridCard
                                            key={
                                                product._id
                                            }
                                            product={
                                                product
                                            }
                                            confirming={
                                                confirmDeleteId ===
                                                product._id
                                            }
                                            onToggleActive={() =>
                                                handleToggleActive(
                                                    product._id,
                                                )
                                            }
                                            onDelete={() =>
                                                handleDelete(
                                                    product._id,
                                                )
                                            }
                                            onCancelDelete={() =>
                                                setConfirmDeleteId(
                                                    null,
                                                )
                                            }
                                        />
                                    ),
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

/* =========================================================
   SHARED PRODUCT PROPS
========================================================= */

interface ProductActionProps {
    product: Product;
    confirming: boolean;
    onToggleActive: () => void;
    onDelete: () => void;
    onCancelDelete: () => void;
}

/* =========================================================
   LIST VIEW
========================================================= */

function ProductListItem({
    product,
    confirming,
    onToggleActive,
    onDelete,
    onCancelDelete,
}: ProductActionProps) {
    const category =
        getCategoryInfo(product);

    const image =
        product.images?.[0];

    const stockStatus =
        product.stock === 0
            ? "out"
            : product.stock <= 5
                ? "low"
                : "good";

    return (
        <article className="group rounded-2xl border border-default bg-surface p-3 transition-all duration-200 hover:border-strong hover:shadow-md sm:p-4">
            <div className="flex items-center gap-3 sm:gap-4">

                {/* Product image */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-muted sm:h-20 sm:w-20">
                    {image ? (
                        <Image
                            src={image}
                            alt={
                                product.name
                            }
                            fill
                            sizes="80px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-muted">
                            No image
                        </div>
                    )}

                    {product.stock ===
                        0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                                <span className="rounded-full bg-surface px-1.5 py-0.5 text-[8px] font-bold text-primary">
                                    Sold out
                                </span>
                            </div>
                        )}
                </div>

                {/* Product information */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                            <h2 className="truncate text-sm font-bold text-primary sm:text-base">
                                {
                                    product.name
                                }
                            </h2>

                            <p className="mt-0.5 truncate text-xs text-muted">
                                {category?.name ??
                                    "Uncategorized"}
                            </p>
                        </div>

                        <span className="shrink-0 text-sm font-black text-primary sm:text-base">
                            {formatPrice(
                                product.price,
                            )}
                        </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <StockBadge
                            status={
                                stockStatus
                            }
                            stock={
                                product.stock
                            }
                        />

                        <VisibilityBadge
                            active={
                                product.isActive
                            }
                        />
                    </div>
                </div>

                {/* Desktop actions */}
                <div className="hidden shrink-0 items-center gap-2 sm:flex">
                    <Link
                        href={`/seller/products/${product._id}/edit`}
                        className="
                            inline-flex
                            h-9
                            items-center
                            gap-1.5
                            rounded-xl
                            border
                            border-default
                            px-3
                            text-xs
                            font-semibold
                            text-primary
                            transition-colors
                            hover:bg-surface-hover
                        "
                    >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                    </Link>

                    <button
                        type="button"
                        onClick={
                            onToggleActive
                        }
                        className="
                            inline-flex
                            h-9
                            items-center
                            gap-1.5
                            rounded-xl
                            border
                            border-default
                            px-3
                            text-xs
                            font-semibold
                            text-secondary
                            transition-colors
                            hover:bg-surface-hover
                            hover:text-primary
                        "
                    >
                        {product.isActive ? (
                            <>
                                <EyeOff className="h-3.5 w-3.5" />
                                Hide
                            </>
                        ) : (
                            <>
                                <Eye className="h-3.5 w-3.5" />
                                Show
                            </>
                        )}
                    </button>

                    {confirming ? (
                        <>
                            <button
                                type="button"
                                onClick={
                                    onDelete
                                }
                                className="
                                    h-9
                                    rounded-xl
                                    bg-red-600
                                    px-3
                                    text-xs
                                    font-bold
                                    text-white
                                    transition-opacity
                                    hover:opacity-90
                                    dark:bg-red-500
                                "
                            >
                                Confirm
                            </button>

                            <button
                                type="button"
                                onClick={
                                    onCancelDelete
                                }
                                className="
                                    h-9
                                    rounded-xl
                                    border
                                    border-default
                                    px-3
                                    text-xs
                                    font-semibold
                                    text-secondary
                                    hover:bg-surface-hover
                                "
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={
                                onDelete
                            }
                            className="
                                inline-flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-xl
                                border
                                border-red-500/20
                                text-red-600
                                transition-colors
                                hover:bg-red-500/5
                                dark:text-red-400
                            "
                            aria-label="Delete product"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Mobile menu indicator */}
                <button
                    type="button"
                    className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        text-muted
                        hover:bg-surface-hover
                        sm:hidden
                    "
                    aria-label="Product actions"
                >
                    <MoreHorizontal className="h-5 w-5" />
                </button>
            </div>

            {/* Mobile actions */}
            <div className="mt-3 flex gap-2 border-t border-default pt-3 sm:hidden">
                <Link
                    href={`/seller/products/${product._id}/edit`}
                    className="
                        flex-1
                        rounded-xl
                        border
                        border-default
                        px-3
                        py-2
                        text-center
                        text-xs
                        font-semibold
                        text-primary
                        hover:bg-surface-hover
                    "
                >
                    Edit
                </Link>

                <button
                    type="button"
                    onClick={
                        onToggleActive
                    }
                    className="
                        flex-1
                        rounded-xl
                        border
                        border-default
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        text-secondary
                        hover:bg-surface-hover
                    "
                >
                    {product.isActive
                        ? "Hide"
                        : "Show"}
                </button>

                {confirming ? (
                    <>
                        <button
                            type="button"
                            onClick={
                                onDelete
                            }
                            className="
                                rounded-xl
                                bg-red-600
                                px-3
                                py-2
                                text-xs
                                font-bold
                                text-white
                                dark:bg-red-500
                            "
                        >
                            Confirm
                        </button>

                        <button
                            type="button"
                            onClick={
                                onCancelDelete
                            }
                            className="
                                rounded-xl
                                border
                                border-default
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-secondary
                            "
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={
                            onDelete
                        }
                        className="
                            rounded-xl
                            border
                            border-red-500/20
                            px-3
                            py-2
                            text-red-600
                            hover:bg-red-500/5
                            dark:text-red-400
                        "
                        aria-label="Delete product"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>
        </article>
    );
}

/* =========================================================
   GRID / CARD VIEW
========================================================= */

function ProductGridCard({
    product,
    confirming,
    onToggleActive,
    onDelete,
    onCancelDelete,
}: ProductActionProps) {
    const category =
        getCategoryInfo(product);

    const image =
        product.images?.[0];

    const stockStatus =
        product.stock === 0
            ? "out"
            : product.stock <= 5
                ? "low"
                : "good";

    return (
        <article className="group overflow-hidden rounded-3xl border border-default bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-strong hover:shadow-lg">

            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
                {image ? (
                    <Image
                        src={image}
                        alt={
                            product.name
                        }
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted">
                        No image
                    </div>
                )}

                {/* Visibility */}
                <div className="absolute left-3 top-3">
                    <VisibilityBadge
                        active={
                            product.isActive
                        }
                    />
                </div>

                {/* Stock overlay */}
                {product.stock ===
                    0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[1px]">
                            <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-primary shadow-lg">
                                Out of stock
                            </span>
                        </div>
                    )}
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate text-[10px] font-bold uppercase tracking-wider text-muted">
                            {category?.name ??
                                "Uncategorized"}
                        </p>

                        <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-bold leading-5 text-primary">
                            {
                                product.name
                            }
                        </h3>
                    </div>

                    <button
                        type="button"
                        className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            text-muted
                            hover:bg-surface-hover
                            hover:text-primary
                        "
                        aria-label="More options"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </div>

                {/* Price + stock */}
                <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                        <p className="text-lg font-black tracking-tight text-primary">
                            {formatPrice(
                                product.price,
                            )}
                        </p>

                        <div className="mt-1">
                            <StockBadge
                                status={
                                    stockStatus
                                }
                                stock={
                                    product.stock
                                }
                            />
                        </div>
                    </div>

                    <Link
                        href={`/seller/products/${product._id}/edit`}
                        className="
                            inline-flex
                            h-9
                            items-center
                            gap-1.5
                            rounded-xl
                            bg-accent
                            px-3
                            text-xs
                            font-bold
                            text-accent-foreground
                            transition-opacity
                            hover:opacity-90
                        "
                    >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                    </Link>
                </div>

                {/* Actions */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={
                            onToggleActive
                        }
                        className="
                            rounded-xl
                            border
                            border-default
                            py-2
                            text-xs
                            font-semibold
                            text-secondary
                            hover:bg-surface-hover
                            hover:text-primary
                        "
                    >
                        {product.isActive
                            ? "Hide product"
                            : "Show product"}
                    </button>

                    {confirming ? (
                        <div className="flex gap-1.5">
                            <button
                                type="button"
                                onClick={
                                    onDelete
                                }
                                className="
                                    flex-1
                                    rounded-xl
                                    bg-red-600
                                    text-xs
                                    font-bold
                                    text-white
                                    hover:opacity-90
                                    dark:bg-red-500
                                "
                            >
                                Delete
                            </button>

                            <button
                                type="button"
                                onClick={
                                    onCancelDelete
                                }
                                className="
                                    flex
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-default
                                    px-2
                                    text-secondary
                                "
                                aria-label="Cancel delete"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={
                                onDelete
                            }
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-1.5
                                rounded-xl
                                border
                                border-red-500/20
                                py-2
                                text-xs
                                font-semibold
                                text-red-600
                                hover:bg-red-500/5
                                dark:text-red-400
                            "
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

/* =========================================================
   STAT CARD
========================================================= */

function ProductStat({
    label,
    value,
    icon,
    tone = "default",
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    tone?:
    | "default"
    | "success"
    | "warning"
    | "danger";
}) {
    const toneClasses = {
        default:
            "bg-surface-muted text-secondary",
        success:
            "bg-success-bg text-success-text",
        warning:
            "bg-warning-bg text-warning-text",
        danger:
            "bg-danger-bg text-danger-text",
    };

    return (
        <div className="rounded-2xl border border-default bg-surface p-4 transition-all hover:-translate-y-0.5 hover:shadow-md sm:rounded-3xl sm:p-5">
            <div
                className={`
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    sm:h-10
                    sm:w-10
                    ${toneClasses[tone]}
                `}
            >
                {icon}
            </div>

            <p className="mt-4 text-2xl font-black tracking-tight text-primary">
                {value}
            </p>

            <p className="mt-0.5 text-xs font-semibold text-secondary">
                {label}
            </p>
        </div>
    );
}

/* =========================================================
   FILTER BUTTON
========================================================= */

function FilterButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                inline-flex
                shrink-0
                items-center
                gap-2
                rounded-xl
                px-3
                py-2
                text-xs
                font-semibold
                transition-all
                ${active
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "bg-surface-muted text-secondary hover:bg-surface-hover hover:text-primary"
                }
            `}
        >
            {children}
        </button>
    );
}

/* =========================================================
   FILTER COUNT
========================================================= */

function FilterCount({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <span className="rounded-md bg-black/5 px-1.5 py-0.5 text-[10px] dark:bg-white/10">
            {children}
        </span>
    );
}

/* =========================================================
   STOCK BADGE
========================================================= */

function StockBadge({
    status,
    stock,
}: {
    status:
    | "out"
    | "low"
    | "good";
    stock: number;
}) {
    if (status === "out") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-danger-bg px-2 py-1 text-[10px] font-bold text-danger-text">
                <span className="h-1.5 w-1.5 rounded-full bg-danger-text" />
                Out of stock
            </span>
        );
    }

    if (status === "low") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning-bg px-2 py-1 text-[10px] font-bold text-warning-text">
                <span className="h-1.5 w-1.5 rounded-full bg-warning-text" />
                {stock} left
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-success-bg px-2 py-1 text-[10px] font-bold text-success-text">
            <span className="h-1.5 w-1.5 rounded-full bg-success-text" />
            {stock} in stock
        </span>
    );
}

/* =========================================================
   VISIBILITY BADGE
========================================================= */

function VisibilityBadge({
    active,
}: {
    active: boolean;
}) {
    if (active) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-1 text-[10px] font-bold text-secondary shadow-sm">
                <Eye className="h-3 w-3" />
                Live
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-1 text-[10px] font-bold text-muted">
            <EyeOff className="h-3 w-3" />
            Hidden
        </span>
    );
}

/* =========================================================
   SKELETON
========================================================= */

function ProductSkeleton({
    view,
}: {
    view: ProductView;
}) {
    if (view === "grid") {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({
                    length: 6,
                }).map((_, index) => (
                    <div
                        key={index}
                        className="h-[340px] animate-pulse rounded-3xl bg-surface-muted"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {Array.from({
                length: 5,
            }).map((_, index) => (
                <div
                    key={index}
                    className="h-24 animate-pulse rounded-2xl bg-surface-muted"
                />
            ))}
        </div>
    );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyProducts({
    hasFilters,
    onClear,
}: {
    hasFilters: boolean;
    onClear: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-default bg-surface-muted/30 px-5 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-muted shadow-sm">
                {hasFilters ? (
                    <Search className="h-6 w-6" />
                ) : (
                    <Package className="h-6 w-6" />
                )}
            </div>

            <h3 className="mt-4 text-sm font-bold text-primary">
                {hasFilters
                    ? "No matching products"
                    : "Your catalog is empty"}
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-muted">
                {hasFilters
                    ? "Try another search or change the selected filter."
                    : "Add your first product to start building your store catalog."}
            </p>

            {hasFilters ? (
                <button
                    type="button"
                    onClick={onClear}
                    className="
                        mt-5
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-default
                        px-4
                        py-2.5
                        text-xs
                        font-bold
                        text-primary
                        transition-colors
                        hover:bg-surface-hover
                    "
                >
                    <X className="h-4 w-4" />
                    Clear filters
                </button>
            ) : (
                <Link
                    href="/seller/products/new"
                    className="
                        mt-5
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-accent
                        px-4
                        py-2.5
                        text-xs
                        font-bold
                        text-accent-foreground
                        transition-opacity
                        hover:opacity-90
                    "
                >
                    <Plus className="h-4 w-4" />
                    Add your first product
                </Link>
            )}
        </div>
    );
}