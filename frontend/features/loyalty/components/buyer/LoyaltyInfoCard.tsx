"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Gift } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPublicProgram } from "../../store/loyaltySlice";
import { selectPublicProgram } from "../../store/loyaltySelectors";

export default function LoyaltyInfoCard({ shopId }: { shopId: string }) {
    const dispatch = useAppDispatch();
    const p = useAppSelector(selectPublicProgram(shopId));
    useEffect(() => { dispatch(fetchPublicProgram(shopId)); }, [dispatch, shopId]);
    if (!p?.enabled) return null;
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-default bg-surface p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent"><Gift className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-primary">Earn {p.pointsPerUnit} point{p.pointsPerUnit > 1 ? "s" : ""} per ₹{p.spendAmount} spent</p>
                <p className="text-xs text-secondary">{p.minRedeemPoints} points = ₹{p.rewardValue} reward{p.expiryDays ? ` · points valid ${p.expiryDays} days` : ""}</p>
            </div>
            <Link href="/buyer/loyalty" className="shrink-0 text-xs font-semibold text-accent hover:underline">My points</Link>
        </div>
    );
}