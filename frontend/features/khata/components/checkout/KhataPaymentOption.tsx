"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { checkKhataEligibility } from "../../store/khataSlice";
import { selectShopKhataStatus, selectAvailableCredit } from "../../store/khataSelectors";

interface Props {
    shopId: string;
    orderTotal: number;
    selected: boolean;
    onSelect: () => void;
}

export default function KhataPaymentOption({ shopId, orderTotal, selected, onSelect }: Props) {
    const dispatch = useAppDispatch();
    const status = useAppSelector(selectShopKhataStatus);

    useEffect(() => {
        dispatch(checkKhataEligibility({ shopId }));
    }, [dispatch, shopId]);

    if (!status?.khataEnabled || !status.khata || status.khata.status !== "approved") return null;

    const available = selectAvailableCredit(status.khata);
    const sufficient = available >= orderTotal;

    return (
        <label
            className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer ${selected ? "border-accent bg-accent/10" : "border-border"
                } ${!sufficient ? "opacity-50 cursor-not-allowed" : ""}`}
        >
            <div className="flex items-center gap-3">
                <input
                    type="radio"
                    name="paymentMethod"
                    checked={selected}
                    disabled={!sufficient}
                    onChange={onSelect}
                />
                <div>
                    <p className="text-sm font-medium">Pay with Khata (Credit)</p>
                    <p className="text-xs text-muted-foreground">
                        Available credit: ₹{available.toLocaleString()}
                    </p>
                </div>
            </div>
            {!sufficient && (
                <span className="text-xs text-red-600 dark:text-red-400">Insufficient credit</span>
            )}
        </label>
    );
}