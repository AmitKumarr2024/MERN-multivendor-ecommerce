"use client";
import { useEffect, useState } from "react";
import { PackageCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchShopReservationStatus, createReservation } from "../../store/reservationSlice";
import {
    selectShopReservationStatus,
    selectReservationActionLoading,
    selectReservationError,
} from "../../store/reservationSelectors";

interface ReserveForPickupButtonProps {
    shopId: string;
    productId: string;
    reservationEnabled: boolean; // product.reservationEnabled
    variantId?: string | null;
    maxQuantity: number;
}

export default function ReserveForPickupButton({
    shopId,
    productId,
    reservationEnabled,
    variantId = null,
    maxQuantity,
}: ReserveForPickupButtonProps) {
    const dispatch = useAppDispatch();
    const shopStatus = useAppSelector(selectShopReservationStatus(shopId));
    const acting = useAppSelector(selectReservationActionLoading);
    const error = useAppSelector(selectReservationError);

    const [open, setOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (reservationEnabled) dispatch(fetchShopReservationStatus(shopId));
    }, [dispatch, shopId, reservationEnabled]);

    if (!reservationEnabled || !shopStatus?.reservationsEnabled || maxQuantity === 0) return null;

    const handleReserve = async () => {
        const result = await dispatch(createReservation({ productId, variantId, quantity }));
        if (createReservation.fulfilled.match(result)) {
            setDone(true);
            setOpen(false);
        }
    };

    return (
        <div className="mt-2">
            {!open ? (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/5 px-5 py-3 text-sm font-semibold text-accent transition hover:bg-accent/10 sm:w-auto"
                >
                    <PackageCheck className="h-4 w-4" />
                    Reserve for Pickup
                </button>
            ) : (
                <div className="rounded-xl border border-default bg-surface p-4">
                    <p className="text-sm font-semibold text-primary">Reserve for pickup</p>
                    {shopStatus.pickupInstructions && (
                        <p className="mt-1 text-xs text-secondary">{shopStatus.pickupInstructions}</p>
                    )}
                    <p className="mt-1 text-xs text-muted">
                        The seller has {shopStatus.reservationExpiryHours}h to confirm, and you'll have{" "}
                        {shopStatus.pickupWindowHours}h to collect it once confirmed.
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                        <input
                            type="number"
                            min={1}
                            max={maxQuantity}
                            value={quantity}
                            onChange={(e) => setQuantity(Math.min(maxQuantity, Math.max(1, Number(e.target.value))))}
                            className="w-20 rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary"
                        />
                        <button
                            type="button"
                            onClick={handleReserve}
                            disabled={acting}
                            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-50"
                        >
                            {acting ? "Reserving..." : "Confirm reservation"}
                        </button>
                        <button type="button" onClick={() => setOpen(false)} className="text-sm text-secondary hover:text-primary">
                            Cancel
                        </button>
                    </div>

                    {error && <p className="mt-2 text-xs text-danger-text">{error}</p>}
                </div>
            )}

            {done && (
                <p className="mt-2 text-xs font-medium text-success-text">
                    Reservation requested — check "My reservations" for status updates.
                </p>
            )}
        </div>
    );
}