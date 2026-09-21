"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProgram, saveProgram } from "../../store/loyaltySlice";
import { selectLoyaltyProgram, selectLoyaltyActionLoading, selectLoyaltyError } from "../../store/loyaltySelectors";
import type { LoyaltyProgram } from "../../types/loyalty.types";

const input = "mt-1.5 w-full rounded-xl border border-default bg-surface px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10";

export default function LoyaltyProgramForm({ shopId }: { shopId: string }) {
    const dispatch = useAppDispatch();
    const program = useAppSelector(selectLoyaltyProgram);
    const saving = useAppSelector(selectLoyaltyActionLoading);
    const error = useAppSelector(selectLoyaltyError);
    const [form, setForm] = useState<LoyaltyProgram | null>(null);
    const [expires, setExpires] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => { dispatch(fetchProgram(shopId)); }, [dispatch, shopId]);
    useEffect(() => { if (program) { setForm(program); setExpires(program.expiryDays != null); } }, [program]);
    if (!form) return <div className="h-40 animate-pulse rounded-2xl bg-surface-muted" />;

    const set = <K extends keyof LoyaltyProgram>(k: K, v: LoyaltyProgram[K]) => { setForm({ ...form, [k]: v }); setSaved(false); };
    const num = (v: string) => (v === "" ? 0 : Number(v));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const r = await dispatch(saveProgram({ shopId, program: { ...form, expiryDays: expires ? form.expiryDays || 365 : null } }));
        if (saveProgram.fulfilled.match(r)) setSaved(true);
    };

    return (
        <form onSubmit={submit} className="space-y-5 rounded-2xl border border-default bg-surface p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-base font-bold text-primary">Loyalty program</h2>
                    <p className="text-xs text-secondary">Customers earn points on delivered orders at your shop only.</p>
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <input type="checkbox" checked={form.enabled} onChange={(e) => set("enabled", e.target.checked)} className="h-4 w-4 accent-accent" />
                    {form.enabled ? "Enabled" : "Disabled"}
                </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-primary">Points earned<input type="number" min={1} value={form.pointsPerUnit} onChange={(e) => set("pointsPerUnit", num(e.target.value))} className={input} /></label>
                <label className="text-sm font-semibold text-primary">For every ₹ spent<input type="number" min={1} value={form.spendAmount} onChange={(e) => set("spendAmount", num(e.target.value))} className={input} /></label>
                <label className="text-sm font-semibold text-primary">Points needed for a reward<input type="number" min={1} value={form.minRedeemPoints} onChange={(e) => set("minRedeemPoints", num(e.target.value))} className={input} /></label>
                <label className="text-sm font-semibold text-primary">Reward value (₹)<input type="number" min={1} value={form.rewardValue} onChange={(e) => set("rewardValue", num(e.target.value))} className={input} /></label>
            </div>

            <div className="rounded-xl bg-surface-muted p-3 text-xs text-secondary">
                Example: a ₹1,000 order earns <b className="text-primary">{Math.floor(1000 / (form.spendAmount || 1)) * form.pointsPerUnit}</b> points.
                {" "}{form.minRedeemPoints} points redeem a <b className="text-primary">₹{form.rewardValue}</b> reward. Points are calculated on item subtotal (tax and shipping excluded).
            </div>

            <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <input type="checkbox" checked={expires} onChange={(e) => { setExpires(e.target.checked); setSaved(false); }} className="h-4 w-4 accent-accent" />
                    Points expire
                </label>
                {expires && (
                    <label className="mt-2 block text-sm text-secondary">Expire after (days)
                        <input type="number" min={1} value={form.expiryDays ?? 365} onChange={(e) => set("expiryDays", num(e.target.value))} className={input} />
                    </label>
                )}
            </div>

            {error && <p className="text-sm text-danger-text">{error}</p>}
            {saved && <p className="text-sm text-success-text">Saved. Changes apply to future orders only.</p>}
            <button type="submit" disabled={saving} className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50">
                {saving ? "Saving..." : "Save program"}
            </button>
        </form>
    );
}