"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Gift, Star } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyAccounts, fetchShopLoyalty, fetchMyTx, redeemReward, fetchMyRedemptions, clearVoucher, clearLoyaltyError } from "../../store/loyaltySlice";
import { selectMyLoyaltyAccounts, selectShopLoyalty, selectMyLoyaltyTx, selectMyRedemptions, selectLastVoucher, selectLoyaltyActionLoading, selectLoyaltyError } from "../../store/loyaltySelectors";
import TxList from "../shared/TxList";

export default function MyLoyalty() {
    const dispatch = useAppDispatch();
    const accounts = useAppSelector(selectMyLoyaltyAccounts);
    const redemptions = useAppSelector(selectMyRedemptions);
    const [shopId, setShopId] = useState<string | null>(null);

    useEffect(() => { dispatch(fetchMyAccounts()); dispatch(fetchMyRedemptions()); }, [dispatch]);
    if (shopId) return <ShopDetail shopId={shopId} onBack={() => { setShopId(null); dispatch(fetchMyAccounts()); dispatch(fetchMyRedemptions()); }} />;

    return (
        <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent"><Star className="h-5 w-5" /></div>
                <div><h1 className="text-xl font-bold text-primary">Loyalty points</h1><p className="text-sm text-secondary">Points are shop-specific. Each shop&apos;s points can only be used at that shop.</p></div>
            </div>

            {accounts.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-default py-14 text-center text-sm text-secondary">No points yet. Earn points when orders from shops with a loyalty program are delivered.</p>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {accounts.map((a) => {
                        const shop = typeof a.shop === "object" && a.shop ? a.shop : null; if (!shop) return null; return (
                            <button key={a._id} onClick={() => setShopId(shop._id)} className="rounded-2xl border border-default bg-surface p-4 text-left transition hover:border-accent/30 hover:shadow-md">
                                <p className="truncate text-sm font-semibold text-primary">{shop.shopName}</p>
                                <p className="mt-2 text-2xl font-bold text-primary">{a.balance} <span className="text-xs font-medium text-muted">points</span></p>
                                <p className="mt-1 text-xs text-muted">Earned {a.totalEarned} · Redeemed {a.totalRedeemed}</p>
                            </button>);
                    })}
                </div>
            )}

            {redemptions && redemptions.items.length > 0 && (
                <section>
                    <h2 className="mb-2 text-sm font-bold text-primary">My rewards</h2>
                    <div className="divide-y divide-default overflow-hidden rounded-2xl border border-default bg-surface">
                        {redemptions.items.map((r) => (
                            <div key={r._id} className="flex items-center justify-between p-3.5">
                                <div><p className="text-sm font-semibold text-primary">{r.code} · ₹{r.value}</p><p className="text-xs text-muted">{typeof r.shop === "object" && r.shop ? r.shop.shopName : ""} · {new Date(r.createdAt).toLocaleDateString("en-IN")}</p></div>
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${r.status === "issued" ? "bg-warning-bg text-warning-text" : "bg-success-bg text-success-text"}`}>{r.status === "issued" ? "Show at shop" : "Used"}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

function ShopDetail({ shopId, onBack }: { shopId: string; onBack: () => void }) {
    const dispatch = useAppDispatch();
    const data = useAppSelector(selectShopLoyalty);
    const tx = useAppSelector(selectMyLoyaltyTx);
    const voucher = useAppSelector(selectLastVoucher);
    const busy = useAppSelector(selectLoyaltyActionLoading);
    const error = useAppSelector(selectLoyaltyError);

    useEffect(() => {
        dispatch(fetchShopLoyalty(shopId)); dispatch(fetchMyTx({ shopId }));
        return () => { dispatch(clearVoucher()); dispatch(clearLoyaltyError()); };
    }, [dispatch, shopId]);

    if (!data || data.shop._id !== shopId) return <div className="mx-auto max-w-4xl p-6"><div className="h-48 animate-pulse rounded-2xl bg-surface-muted" /></div>;
    const { account, program, rewards, nextExpiry } = data;

    const redeem = async () => {
        const r = await dispatch(redeemReward({ shopId }));
        if (redeemReward.fulfilled.match(r)) dispatch(fetchMyTx({ shopId }));
    };

    return (
        <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6">
            <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-primary"><ArrowLeft className="h-4 w-4" />All shops</button>
            <div className="rounded-2xl border border-default bg-surface p-5">
                <p className="text-sm font-semibold text-secondary">{data.shop.shopName}</p>
                <p className="mt-1 text-4xl font-black text-primary">{account.balance}<span className="ml-2 text-sm font-medium text-muted">points</span></p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    {[["Earned", account.totalEarned], ["Redeemed", account.totalRedeemed], ["Expired", account.totalExpired]].map(([l, v]) => (
                        <div key={l as string} className="rounded-xl bg-surface-muted p-3"><p className="text-lg font-bold text-primary">{v}</p><p className="text-[11px] text-muted">{l}</p></div>
                    ))}
                </div>
                {nextExpiry && <p className="mt-3 text-xs text-warning-text">{nextExpiry.points} points expire on {new Date(nextExpiry.expiresAt).toLocaleDateString("en-IN")}.</p>}
                {account.balance < 0 && <p className="mt-3 text-xs text-danger-text">Your balance is negative because points from a cancelled or refunded order were reversed.</p>}
            </div>

            <section>
                <h2 className="mb-2 text-sm font-bold text-primary">Available rewards</h2>
                {!program.enabled ? <p className="rounded-xl border border-dashed border-default p-5 text-sm text-secondary">This shop&apos;s loyalty program isn&apos;t active right now.</p> : rewards.map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-3 rounded-2xl border border-default bg-surface p-4">
                        <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent"><Gift className="h-5 w-5" /></div>
                            <div><p className="text-sm font-semibold text-primary">{r.name}</p><p className="text-xs text-muted">{r.pointsCost} points each{r.redeemableNow > 0 ? ` · you can redeem ${r.redeemableNow}` : ` · need ${r.pointsCost - account.balance} more`}</p></div></div>
                        <button onClick={redeem} disabled={busy || r.redeemableNow < 1} className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-40">{busy ? "..." : "Redeem"}</button>
                    </div>
                ))}
                {error && <p className="mt-2 text-sm text-danger-text">{error}</p>}
                {voucher && <div className="mt-3 rounded-xl bg-success-bg p-4 text-sm text-success-text">Reward ready! Show code <b>{voucher.code}</b> (₹{voucher.value}) at the shop.</div>}
            </section>

            <section><h2 className="mb-2 text-sm font-bold text-primary">History</h2><TxList items={tx?.items ?? []} /></section>
        </div>
    );
}