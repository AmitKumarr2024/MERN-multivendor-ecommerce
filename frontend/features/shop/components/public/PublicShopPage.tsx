"use client";

import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchShopBySlug, clearViewedShop } from "../../store/shopSlice";
import {
    selectViewedShop,
    selectViewedShopLoading,
    selectShopError,
} from "../../store/shopSelectors";

import { fetchProductsByShopSlug, selectShopProducts, selectShopProductsLoading } from "@/features/products";
import { DeliveryEstimate } from "@/features/logistics";
import { StartChatButton } from "@/features/messaging";
import { KhataApplyCard } from "@/features/khata";

import ShopHeader from "./sections/ShopHeader";
import ProductsSection from "./sections/ProductsSection";
import BusinessHoursCard from "./sidebar/BusinessHoursCard";
import StaffSection from "./sidebar/StaffSection";
import { LoyaltyInfoCard } from "@/features/loyalty";
import { ShopOffersList } from "@/features/offers";

interface PublicShopPageProps {
    slug: string;
}

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
            <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
                <div className="h-52 animate-pulse rounded-3xl bg-surface-muted" />
                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <div className="h-96 animate-pulse rounded-3xl bg-surface-muted" />
                    <div className="h-40 animate-pulse rounded-3xl bg-surface-muted" />
                </div>
            </div>
        );
    }

    if (error || !shop) {
        return (
            <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center p-4 sm:p-6">
                <div className="w-full max-w-md rounded-3xl border border-dashed border-default bg-surface p-10 text-center">
                    <p className="text-sm font-semibold text-secondary">
                        {error || "Shop not found."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full">
            <div className="mx-auto max-w-7xl space-y-6 px-4 pb-24 pt-5 sm:px-6 sm:pb-10 sm:pt-6 lg:px-8">
                <ShopHeader shop={shop} />

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="min-w-0 space-y-6">
                        <KhataApplyCard shopId={shop._id} />
                        <ShopOffersList shopId={shop._id} />
                        <LoyaltyInfoCard shopId={shop._id} />
                        <ProductsSection
                            shopSlug={shop.slug}
                            shopId={shop._id}
                            shopName={shop.shopName}
                            products={products}
                            productsLoading={productsLoading}
                        />
                    </div>

                    <aside className="space-y-4">
                        <BusinessHoursCard businessHours={shop.businessHours} />
                        <DeliveryEstimate shopId={shop._id} />
                        <StaffSection shopId={shop._id} shopName={shop.shopName} />
                    </aside>
                </div>
            </div>

            {/* Sticky mobile action bar — chat with shop, always reachable */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-default bg-surface/95 p-3 backdrop-blur-sm sm:hidden">
                <StartChatButton
                    shopId={shop._id}
                    className="my-0! w-full justify-center"
                />
            </div>
        </div>
    );
}