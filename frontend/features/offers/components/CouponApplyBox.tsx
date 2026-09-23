"use client";

import { useState } from "react";
import { Tag, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { validateCoupon, clearCouponResult } from "../store/offerSlice";
import { selectCouponResult, selectCouponValidating } from "../store/offerSelectors";

interface CouponApplyBoxProps {
    shopId: string;
    onApplied: (code: string | null, discountAmount: number) => void;
}

const REASON_MESSAGES: Record<string, string> = {
    not_found: "That code doesn't exist for this shop.",
    inactive: "This coupon is no longer active.",
    expired: "This coupon has expired.",
    usage_limit_reached: "This coupon has reached its usage limit.",
    per_customer_limit_reached: "You've already used this coupon the maximum number of times.",
    below_minimum_order: "Your order doesn't meet this coupon's minimum value.",
    no_eligible_items: "None of the items in your cart qualify for this coupon.",
};

export default function CouponApplyBox({ shopId, onApplied }: CouponApplyBoxProps) {
    const dispatch = useAppDispatch();
    const result = useAppSelector(selectCouponResult);
    const validating = useAppSelector(selectCouponValidating);
    const [code, setCode] = useState("");
    const [applied, setApplied] = useState<string | null>(null);

    const handleApply = async () => {
        if (!code.trim()) return;
        const res = await dispatch(validateCoupon({ shopId, code: code.trim() }));
        if (validateCoupon.fulfilled.match(res) && res.payload.eligible) {
            setApplied(code.trim().toUpperCase());
            onApplied(code.trim().toUpperCase(), res.payload.discountAmount ?? 0);
        } else {
            onApplied(null, 0);
        }
    };

    const handleRemove = () => {
        setApplied(null);
        setCode("");
        dispatch(clearCouponResult());
        onApplied(null, 0);
    };

    if (applied && result?.eligible) {
        return (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/5 px-3.5 py-2.5">
                <div className="flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4 text-accent" />
                    <span className="font-semibold text-primary">{applied}</span>
                    <span className="text-secondary">applied — you save ₹{result.discountAmount}</span>
                </div>
                <button type="button" onClick={handleRemove} className="text-secondary hover:text-primary" aria-label="Remove coupon">
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 rounded-lg border border-default bg-surface px-3 py-2 text-sm uppercase text-primary focus:border-accent focus:outline-none"
                />
                <button
                    type="button"
                    onClick={handleApply}
                    disabled={!code.trim() || validating}
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50"
                >
                    {validating ? "Checking..." : "Apply"}
                </button>
            </div>
            {result && !result.eligible && (
                <p className="mt-1.5 text-xs text-danger-text">{REASON_MESSAGES[result.reason ?? ""] ?? "This coupon can't be applied."}</p>
            )}
        </div>
    );
}