"use client";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    verifyPickupCode,
    clearReservationError,
} from "../../store/reservationSlice";
import {
    selectReservationActionLoading,
    selectReservationError,
} from "../../store/reservationSelectors";

interface Props {
    reservationId: string;
    onClose: () => void;
}

export default function PickupVerificationPanel({ reservationId, onClose }: Props) {
    const dispatch = useAppDispatch();
    const acting = useAppSelector(selectReservationActionLoading);
    const error = useAppSelector(selectReservationError);
    const [code, setCode] = useState("");

    // Start clean - don't show a stale error from some other action.
    useEffect(() => {
        dispatch(clearReservationError());
    }, [dispatch]);

    const valid = /^\d{6}$/.test(code);

    const submit = async () => {
        if (!valid || acting) return;
        const result = await dispatch(
            verifyPickupCode({ id: reservationId, pickupCode: code }),
        );
        // The backend decides. We only react to its answer.
        if (verifyPickupCode.fulfilled.match(result)) {
            setCode("");
            onClose();
        }
    };

    return (
        <div className="mt-3 space-y-3 rounded-xl bg-surface-muted p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <ShieldCheck className="h-4 w-4 text-accent" />
                Enter the 6-digit pickup code shown by the buyer
            </div>

            <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                inputMode="numeric"
                autoComplete="off"
                autoFocus
                maxLength={6}
                placeholder="••••••"
                aria-label="Pickup code"
                className="w-full rounded-lg border border-default bg-surface px-3 py-2 text-center text-lg font-bold tracking-[0.5em] text-primary"
            />

            {error && <p className="text-xs text-danger-text">{error}</p>}

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={submit}
                    disabled={!valid || acting}
                    className="rounded-lg bg-success-bg px-3 py-1.5 text-xs font-semibold text-success-text disabled:opacity-50"
                >
                    {acting ? "Verifying..." : "Verify & Complete Pickup"}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-xs text-secondary"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}