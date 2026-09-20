"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyShop, selectMyShop, selectHasCheckedMyShop } from "@/features/shop";
import SellerCustomers from "./SellerCustomers";

export default function SellerCustomersPage() {
    const dispatch = useAppDispatch();
    const shop = useAppSelector(selectMyShop);
    const checked = useAppSelector(selectHasCheckedMyShop);

    useEffect(() => {
        dispatch(fetchMyShop());
    }, [dispatch]);

    if (!checked) return <div className="mx-auto max-w-6xl p-6"><div className="h-40 animate-pulse rounded-2xl bg-surface-muted" /></div>;
    if (!shop) return <div className="mx-auto max-w-6xl p-6 text-sm text-secondary">Create your shop first to see customers.</div>;

    return (
        <div className="mx-auto max-w-6xl p-4 pb-10 sm:p-6">
            <SellerCustomers shopId={shop._id} />
        </div>
    );
}