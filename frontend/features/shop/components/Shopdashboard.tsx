"use client";

import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyShop } from "../store/shopSlice";
import { selectHasCheckedMyShop, selectMyShop, selectMyShopLoading } from "../store/shopSelectors";

import CreateShopForm from "./Createshopform";
import ShopSettingsForm from "./Shopsettingsform";
import ShopSlugManager from "./Shopslugmanager";
import BusinessHoursEditor from "./Businesshourseditor";
import HolidayManager from "./Holidaymanager";

export default function ShopDashboard() {
    const dispatch = useAppDispatch();

    const shop = useAppSelector(selectMyShop);
    const loading = useAppSelector(selectMyShopLoading);
    const hasChecked = useAppSelector(selectHasCheckedMyShop);

    useEffect(() => {
        dispatch(fetchMyShop());
    }, [dispatch]);

    if (loading && !hasChecked) {
        return (
            <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-32 animate-pulse rounded-2xl border border-gray-200 bg-gray-50" />
                ))}
            </div>
        );
    }

    // No shop yet — onboarding flow (this is also what upgrades a buyer to seller).
    if (hasChecked && !shop) {
        return <CreateShopForm />;
    }

    if (!shop) return null;

    return (
        <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
            <div>
                <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">My Shop</h1>
                <p className="text-sm text-gray-500">Manage your dukan&apos;s public info and hours.</p>
            </div>

            <ShopSettingsForm shop={shop} />
            <ShopSlugManager shop={shop} />
            <BusinessHoursEditor shop={shop} />
            <HolidayManager shop={shop} />
        </div>
    );
}