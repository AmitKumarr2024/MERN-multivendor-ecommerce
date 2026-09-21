"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchShopRedemptions, fulfillRedemption } from "../../store/loyaltySlice";
import { selectShopRedemptions, selectLoyaltyActionLoading } from "../../store/loyaltySelectors";

export default function LoyaltyRedemptions({ shopId }: { shopId: string }) {
    const dispatch = useAppDispatch();
    const data = useAppSelector(selectShopRedemptions);
    const busy = useAppSelector(selectLoyaltyActionLoading);
    useEffect(() => { dispatch(fetchShopRedemptions(shopId)); }, [dispatch, shopId]);

    if (!data || data.items.length === 0) return <p className="rounded-2xl border border-dashed border-default py-12 text-center text-sm text-secondary">No rewards redeemed yet.</p>;
    return (
        <div className="divide-y divide-default overflow-hidden rounded-2xl border border-default bg-surface">
            {data.items.map((r) => {
                const b = typeof r.buyer === "object" && r.buyer ? r.buyer : null;
                return (
                    <div key={r._id} className="flex items-center justify-between gap-3 p-4">
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-primary">{r.code} · ₹{r.value}</p>
                            <p className="truncate text-xs text-muted">{b?.name} · {r.points} pts · {new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                        </div>
                        {r.status === "issued" ? (
                            <button disabled={busy} onClick={() => dispatch(fulfillRedemption({ shopId, id: r._id }))} className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground disabled:opacity-50">Mark as given</button>
                        ) : <span className="rounded-full bg-success-bg px-2.5 py-1 text-[11px] font-semibold text-success-text">Fulfilled</span>}
                    </div>
                );
            })}
        </div>
    );
}