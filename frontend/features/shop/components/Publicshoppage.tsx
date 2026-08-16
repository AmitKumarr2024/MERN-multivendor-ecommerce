"use client";

import { useEffect } from "react";
import Image from "next/image";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchShopBySlug, clearViewedShop } from "../store/shopSlice";
import {
    selectViewedShop,
    selectViewedShopLoading,
    selectShopError,
} from "../store/shopSelectors";
import type { DayName } from "../types/shop.types";

import {
    fetchProductsByShopSlug,
    ProductGrid,
    selectShopProducts,
    selectShopProductsLoading,
} from "@/features/products";

import {
    ShopBroadcastBanner,
    StartChatButton,
} from "@/features/messaging";

import { DeliveryEstimate } from "@/features/logistics";

interface PublicShopPageProps {
    slug: string;
}

const DAY_ORDER: DayName[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
];

export default function PublicShopPage({ slug }: PublicShopPageProps) {
    const dispatch = useAppDispatch();

    const shop = useAppSelector(selectViewedShop);
    const loading = useAppSelector(selectViewedShopLoading);
    const error = useAppSelector(selectShopError);

    const products = useAppSelector(selectShopProducts);
    const productsLoading = useAppSelector(selectShopProductsLoading);

    useEffect(() => {
        dispatch(fetchShopBySlug(slug));
        dispatch(fetchProductsByShopSlug(slug));

        return () => {
            dispatch(clearViewedShop());
        };
    }, [dispatch, slug]);

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl animate-pulse p-4 sm:p-6">
                <div className="h-32 rounded-2xl bg-surface-muted" />
            </div>
        );
    }

    if (error || !shop) {
        return (
            <div className="mx-auto max-w-7xl p-4 sm:p-6">
                <div className="rounded-2xl border border-dashed border-default bg-surface p-10 text-center text-sm text-secondary">
                    {error || "Shop not found."}
                </div>
            </div>
        );
    }

    const todayIndex = (new Date().getDay() + 6) % 7;

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
            {/* Shop header */}
            <div className="overflow-hidden rounded-2xl border border-default bg-surface shadow-sm">
                {shop.banner ? (
                    <div className="relative h-32 w-full sm:h-56">
                        <Image
                            src={shop.banner}
                            alt=""
                            fill
                            className="object-center aspect-video"
                        />
                    </div>
                ) : (
                    <div className="h-20 bg-surface-muted" />
                )}

                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:p-6">
                    <div className="relative -mt-10 h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-surface bg-surface-muted shadow-sm sm:h-24 sm:w-24">
                        {shop.logo ? (
                            <Image
                                src={shop.logo}
                                alt={shop.shopName}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-2xl font-bold text-muted">
                                {shop.shopName.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-xl font-semibold text-primary sm:text-2xl">
                                {shop.shopName}
                            </h1>

                            {shop.isVerified && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-info-bg px-2 py-0.5 text-xs font-medium text-info-text">
                                    ✓ Verified
                                </span>
                            )}

                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${shop.isOpen
                                        ? "bg-success-bg text-success-text"
                                        : "bg-surface-muted text-secondary"
                                    }`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${shop.isOpen
                                            ? "bg-success-text"
                                            : "bg-muted"
                                        }`}
                                />

                                {shop.isOpen ? "Open now" : "Closed"}
                            </span>
                        </div>

                        {shop.description ? (
                            <p className="mt-1 text-sm text-secondary">
                                {shop.description}
                            </p>
                        ) : null}

                        {shop.address?.city ? (
                            <p className="mt-1 text-xs text-muted">
                                {[shop.address.city, shop.address.state]
                                    .filter(Boolean)
                                    .join(", ")}
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                {/* Products */}
                <div>
                    <h2 className="mb-3 text-base font-semibold text-primary">
                        Products from {shop.shopName}
                    </h2>

                    <ShopBroadcastBanner shopSlug={shop.slug} />

                    <StartChatButton shopId={shop._id} />

                    <ProductGrid
                        products={products}
                        loading={productsLoading}
                        emptyMessage="This shop hasn't listed any products yet."
                    />
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Business hours */}
                    <div className="h-fit rounded-2xl border border-default bg-surface p-4 shadow-sm sm:p-5">
                        <h3 className="mb-3 text-sm font-semibold text-primary">
                            Business hours
                        </h3>

                        <ul className="space-y-1.5 text-sm">
                            {DAY_ORDER.map((day, i) => {
                                const h = shop.businessHours[day];
                                const isToday = i === todayIndex;

                                return (
                                    <li
                                        key={day}
                                        className={`flex justify-between ${isToday
                                                ? "font-semibold text-primary"
                                                : "text-secondary"
                                            }`}
                                    >
                                        <span className="capitalize">
                                            {day}
                                        </span>

                                        <span>
                                            {h.isClosed
                                                ? "Closed"
                                                : `${h.open} - ${h.close}`}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Delivery estimate */}
                    <DeliveryEstimate shopId={shop._id} />
                </div>
            </div>
        </div>
    );
}