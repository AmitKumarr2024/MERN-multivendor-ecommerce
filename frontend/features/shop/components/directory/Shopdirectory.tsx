"use client";

import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { fetchAllShops } from "../../store/shopSlice";

import {
    selectDirectoryLoading,
    selectShopPage,
    selectShopPages,
    selectShopTotal,
    selectShops,
} from "../../store/shopSelectors";

import ShopCard from "./Shopcard";

export default function ShopDirectory() {
    const dispatch = useAppDispatch();

    /* =========================================================
       SHOP STATE
    ========================================================= */

    const shops = useAppSelector(selectShops);
    const total = useAppSelector(selectShopTotal);
    const page = useAppSelector(selectShopPage);
    const pages = useAppSelector(selectShopPages);
    const loading = useAppSelector(selectDirectoryLoading);

    /* =========================================================
       LOCAL SEARCH / PAGINATION
    ========================================================= */

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    /* =========================================================
       FETCH SHOPS
       
       ShopCard itself handles:
       - staff
       - owner
       - open/closed
       
       Therefore this component only handles the shop list.
    ========================================================= */

    useEffect(() => {
        dispatch(
            fetchAllShops({
                search: search.trim() || undefined,
                page: currentPage,
            }),
        );
    }, [
        dispatch,
        search,
        currentPage,
    ]);

    /* =========================================================
       SEARCH
    ========================================================= */

    const handleSearch = (
        value: string,
    ) => {
        setSearch(value);
        setCurrentPage(1);
    };

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div
            className="
                mx-auto
                max-w-6xl
                space-y-4
                p-4
                sm:space-y-6
                sm:p-6
            "
        >
            {/* =================================================
                HEADER
            ================================================= */}

            <div>
                <h1
                    className="
                        text-xl
                        font-semibold
                        text-primary
                        sm:text-2xl
                    "
                >
                    All shops
                </h1>

                {!loading && (
                    <p className="text-sm text-secondary">
                        {total} shops found
                    </p>
                )}
            </div>

            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="relative max-w-md">
                <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                        handleSearch(event.target.value)
                    }
                    placeholder="Search shops..."
                    aria-label="Search shops"
                    className="
                        w-full
                        rounded-lg
                        border
                        border-strong
                        py-2.5
                        pl-9
                        pr-3
                        text-sm
                        text-primary
                        shadow-sm
                        focus:border-accent
                        focus:outline-none
                        focus:ring-1
                        focus:ring-accent
                    "
                />

                <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="
                        pointer-events-none
                        absolute
                        left-3
                        top-1/2
                        h-4
                        w-4
                        -translate-y-1/2
                        text-muted
                    "
                    aria-hidden="true"
                >
                    <path
                        fillRule="evenodd"
                        d="
                            M9 3.5a5.5 5.5 0 1 0
                            3.61 9.65l3.62 3.62a.75.75 0 1 0
                            1.06-1.06l-3.62-3.62A5.5 5.5 0 0 0
                            9 3.5ZM5 9a4 4 0 1 1
                            8 0 4 4 0 0 1-8 0Z
                        "
                        clipRule="evenodd"
                    />
                </svg>
            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (
                <div
                    className="
                        grid
                        grid-cols-2
                        gap-3
                        sm:grid-cols-3
                        sm:gap-4
                        lg:grid-cols-4
                    "
                >
                    {Array.from({
                        length: 8,
                    }).map((_, index) => (
                        <div
                            key={index}
                            className="
                                h-48
                                animate-pulse
                                rounded-2xl
                                border
                                border-default
                                bg-surface-muted
                                sm:h-56
                            "
                        />
                    ))}
                </div>
            ) : shops.length === 0 ? (
                /* =================================================
                   EMPTY
                ================================================= */

                <div
                    className="
                        rounded-2xl
                        border
                        border-dashed
                        border-default
                        bg-surface
                        py-16
                        text-center
                        text-sm
                        text-secondary
                    "
                >
                    No shops found.
                </div>
            ) : (
                /* =================================================
                   SHOPS
                ================================================= */

                <div
                    className="
                        grid
                        grid-cols-2
                        gap-3
                        sm:grid-cols-3
                        sm:gap-4
                        lg:grid-cols-4
                    "
                >
                    {shops.map((shop) => (
                        <ShopCard
                            key={shop._id}
                            shop={shop}
                        />
                    ))}
                </div>
            )}

            {/* =================================================
                PAGINATION
            ================================================= */}

            {pages > 1 && (
                <div
                    className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        pt-2
                    "
                >
                    <button
                        type="button"
                        onClick={() =>
                            setCurrentPage(
                                (previous) =>
                                    Math.max(
                                        1,
                                        previous - 1,
                                    ),
                            )
                        }
                        disabled={page <= 1}
                        className="
                            rounded-lg
                            border
                            border-strong
                            px-3
                            py-1.5
                            text-sm
                            text-secondary
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                    >
                        Prev
                    </button>

                    <span className="text-sm text-secondary">
                        Page {page} of {pages}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setCurrentPage(
                                (previous) =>
                                    Math.min(
                                        pages,
                                        previous + 1,
                                    ),
                            )
                        }
                        disabled={page >= pages}
                        className="
                            rounded-lg
                            border
                            border-strong
                            px-3
                            py-1.5
                            text-sm
                            text-secondary
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}