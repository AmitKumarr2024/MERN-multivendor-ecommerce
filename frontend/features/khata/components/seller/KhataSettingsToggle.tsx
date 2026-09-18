"use client";

import { useEffect } from "react";
import { CreditCard, Check } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    fetchShopKhataStatus,
    setShopKhataEnabled,
} from "../../store/khataSlice";
import {
    selectShopKhataStatus,
    selectKhataActionLoading,
} from "../../store/khataSelectors";

export default function KhataSettingsToggle({
    shopId,
}: {
    shopId: string;
}) {
    const dispatch = useAppDispatch();

    const status = useAppSelector(selectShopKhataStatus);
    const actionLoading = useAppSelector(selectKhataActionLoading);

    useEffect(() => {
        dispatch(fetchShopKhataStatus(shopId));
    }, [dispatch, shopId]);

    const enabled = status?.khataEnabled ?? false;

    const handleToggle = () => {
        if (actionLoading) return;

        dispatch(
            setShopKhataEnabled({
                shopId,
                enabled: !enabled,
            })
        );
    };

    return (
        <div
            className={`rounded-2xl border p-4 transition-colors sm:p-5 ${enabled
                ? "border-accent/30 bg-accent/5"
                : "border-default bg-surface"
                }`}
        >
            <div className="flex items-center justify-between gap-4">
                {/* =========================================================
                    LEFT CONTENT
                   ========================================================= */}
                <div className="flex min-w-0 items-start gap-3">
                    {/* Icon */}
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${enabled
                            ? "bg-accent/15 text-accent"
                            : "bg-surface-muted text-secondary"
                            }`}
                    >
                        <CreditCard className="h-5 w-5" />
                    </div>

                    {/* Text */}
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-primary sm:text-base">
                                Enable Khata (Credit) for this shop
                            </p>

                            {enabled && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                                    <Check className="h-3 w-3" />
                                    Enabled
                                </span>
                            )}
                        </div>

                        <p className="mt-1 max-w-2xl text-xs leading-5 text-secondary sm:text-sm">
                            Let buyers apply for shop credit. You approve each
                            request individually.
                        </p>
                    </div>
                </div>

                {/* =========================================================
                    TOGGLE
                   ========================================================= */}
                <button
                    type="button"
                    onClick={handleToggle}
                    disabled={actionLoading}
                    aria-pressed={enabled}
                    aria-label="Toggle Khata for this shop"
                    className={`relative h-6 w-11 shrink-0 overflow-hidden rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50 ${enabled
                            ? "bg-accent"
                            : "bg-surface-muted"
                        }`}
                >
                    <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full border shadow-sm transition-all duration-200 ${enabled
                                ? "right-0.5 border-white/20 bg-slate-400"
                                : "left-0.5 border-default bg-surface"
                            }`}
                    />
                </button>
            </div>
        </div>
    );
}