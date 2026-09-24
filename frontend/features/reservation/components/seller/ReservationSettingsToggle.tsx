"use client";
import { useEffect, useState } from "react";
import { PackageCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchShopReservationStatus, updateShopReservationSettings } from "../../store/reservationSlice";
import { selectShopReservationStatus, selectReservationActionLoading } from "../../store/reservationSelectors";

export default function ReservationSettingsToggle({ shopId }: { shopId: string }) {
    const dispatch = useAppDispatch();
    const status = useAppSelector(selectShopReservationStatus(shopId));
    const acting = useAppSelector(selectReservationActionLoading);
    const [instructions, setInstructions] = useState("");

    useEffect(() => { dispatch(fetchShopReservationStatus(shopId)); }, [dispatch, shopId]);
    useEffect(() => { if (status) setInstructions(status.pickupInstructions); }, [status?.pickupInstructions]);

    const enabled = status?.reservationsEnabled ?? false;

    return (
        <div className="rounded-2xl border border-default bg-surface p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent"><PackageCheck className="h-5 w-5" /></div>
                    <div>
                        <p className="text-sm font-bold text-primary">Reserve for Pickup</p>
                        <p className="mt-0.5 text-xs text-secondary">Let buyers reserve products and collect them at your shop.</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => dispatch(updateShopReservationSettings({ shopId, payload: { enabled: !enabled } }))}
                    disabled={acting}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${enabled ? "bg-accent" : "bg-surface-muted"}`}
                >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow-sm transition-all ${enabled ? "right-0.5" : "left-0.5"}`} />
                </button>
            </div>

            {enabled && (
                <div className="mt-4 space-y-2">
                    <label className="text-xs font-semibold text-primary">Pickup instructions for buyers</label>
                    <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        onBlur={() => dispatch(updateShopReservationSettings({ shopId, payload: { pickupInstructions: instructions } }))}
                        rows={2}
                        maxLength={500}
                        placeholder="e.g. Bring your order ID and a valid ID to collect."
                        className="w-full rounded-xl border border-default bg-surface p-2.5 text-sm text-primary"
                    />
                </div>
            )}
        </div>
    );
}