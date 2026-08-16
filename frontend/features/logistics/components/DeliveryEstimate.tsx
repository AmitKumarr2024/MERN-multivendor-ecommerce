"use client";

import { useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { checkServiceability, clearServiceabilityResult } from "../store/logisticsSlice";
import {
    selectServiceabilityError,
    selectServiceabilityLoading,
    selectServiceabilityResult,
} from "../store/logisticsSelectors";

interface DeliveryEstimateProps {
    shopId: string;
    weightKg?: number;
}

/**
 * Usage on the product detail page:
 *
 *   <DeliveryEstimate shopId={shop._id} weightKg={product.weightKg} />
 *
 * Calls the public POST /api/logistics/check endpoint — no order needs
 * to exist yet. Doesn't reveal which courier will be used, only
 * "serviceable / not", estimated rate, and estimated days, matching
 * the backend's intentional abstraction (seller/buyer never sees
 * courier names before an order is placed).
 */
export default function DeliveryEstimate({ shopId, weightKg }: DeliveryEstimateProps) {
    const dispatch = useAppDispatch();
    const result = useAppSelector(selectServiceabilityResult);
    const loading = useAppSelector(selectServiceabilityLoading);
    const error = useAppSelector(selectServiceabilityError);

    const [pincode, setPincode] = useState("");

    const handleCheck = (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^\d{6}$/.test(pincode)) return;
        dispatch(checkServiceability({ shopId, deliveryPincode: pincode, weightKg }));
    };

    const handleChange = (value: string) => {
        setPincode(value.replace(/\D/g, "").slice(0, 6));
        if (result || error) dispatch(clearServiceabilityResult());
    };

    return (
        <div className="rounded-xl border border-default bg-surface p-3.5">
            <p className="mb-2 text-xs font-medium text-secondary">Check delivery availability</p>

            <form onSubmit={handleCheck} className="flex flex-col gap-2">
                <input
                    type="text"
                    inputMode="numeric"
                    value={pincode}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder="Enter pincode"
                    maxLength={6}
                    className="flex-1 rounded-lg border border-default bg-surface px-1 py-2 text-sm focus:border-zinc-900 focus:outline-none dark:focus:border-zinc-100"
                />
                <button
                    type="submit"
                    disabled={pincode.length !== 6 || loading}
                    className="shrink-0 rounded-lg border border-strong px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-surface-hover disabled:opacity-40"
                >
                    {loading ? "Checking..." : "Check"}
                </button>
            </form>

            {error && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
            )}

            {result && (
                <div className="mt-2.5">
                    {result.serviceable ? (
                        <div className="flex items-center gap-2 text-sm">
                            <svg
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400"
                            >
                                <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm3.7 5.7-4.5 4.5-2.9-2.9 1.06-1.06L9.2 9.14l3.44-3.44 1.06 1Z" />
                            </svg>
                            <span className="text-primary">
                                Delivery in ~{result.estimatedDeliveryDays ?? "a few"} days
                                {typeof result.estimatedRate === "number" && (
                                    <> · ₹{result.estimatedRate.toLocaleString("en-IN")} shipping</>
                                )}
                            </span>
                        </div>
                    ) : (
                        <p className="text-sm text-red-600 dark:text-red-400">
                            Sorry, this shop doesn&apos;t deliver to this pincode yet.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}