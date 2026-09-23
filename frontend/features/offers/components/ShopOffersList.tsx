"use client";

import { useEffect } from "react";
import { Tag } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPublicOffers } from "../store/offerSlice";
import { selectPublicOffers } from "../store/offerSelectors";

export default function ShopOffersList({ shopId }: { shopId: string }) {
    const dispatch = useAppDispatch();
    const offers = useAppSelector(selectPublicOffers(shopId));

    useEffect(() => { dispatch(fetchPublicOffers(shopId)); }, [dispatch, shopId]);

    if (offers.length === 0) return null;

    return (
        <section className="overflow-hidden rounded-2xl border border-default bg-surface">
            <div className="flex items-center gap-3 border-b border-default px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Tag className="h-4 w-4" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-primary">Offers at this shop</h2>
                    <p className="text-[11px] text-muted">{offers.length} active offer{offers.length !== 1 ? "s" : ""}</p>
                </div>
            </div>
            <ul className="divide-y divide-default">
                {offers.map((offer) => (
                    <li key={offer._id} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-primary">
                                {offer.code} — {offer.discountType === "percentage" ? `${offer.discountValue}% off` : `₹${offer.discountValue} off`}
                            </p>
                            {offer.description && <p className="mt-0.5 truncate text-xs text-secondary">{offer.description}</p>}
                            {offer.minOrderValue > 0 && <p className="mt-0.5 text-[11px] text-muted">Min order ₹{offer.minOrderValue}</p>}
                        </div>
                        <span className="shrink-0 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent">
                            {offer.scope === "shop" ? "Storewide" : offer.scope === "category" ? "Category" : "Select items"}
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
}