"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyKhatas } from "../../store/khataSlice";
import { selectMyKhatas, selectAvailableCredit } from "../../store/khataSelectors";
import type { Khata } from "../../types/khata.types";
import KhataStatusBadge from "../shared/KhataStatusBadge";
import Modal from "@/components/ui/Modal";
import KhataDashboard from "./KhataDashboard";

export default function MyKhatasList() {
    const dispatch = useAppDispatch();
    const khatas = useAppSelector(selectMyKhatas);
    const [selected, setSelected] = useState<Khata | null>(null);

    useEffect(() => {
        dispatch(fetchMyKhatas());
    }, [dispatch]);

    if (khatas.length === 0) {
        return <p className="text-sm text-muted-foreground py-8 text-center">No Khata accounts yet.</p>;
    }

    return (
        <div className="space-y-3">
            {khatas.map((k) => {
                const shop = typeof k.shop === "string" ? null : k.shop;
                const available = selectAvailableCredit(k);
                return (
                    <button
                        key={k._id}
                        onClick={() => setSelected(k)}
                        className="w-full text-left rounded-xl border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <p className="font-medium">{shop?.shopName ?? "Shop"}</p>
                            <KhataStatusBadge status={k.status} />
                        </div>
                        {k.status === "approved" && (
                            <p className="text-sm text-muted-foreground mt-1">
                                Available: ₹{available.toLocaleString()} of ₹{k.creditLimit.toLocaleString()}
                            </p>
                        )}
                    </button>
                );
            })}

            <Modal open={!!selected} onClose={() => setSelected(null)} title="Khata Details">
                {selected && <KhataDashboard khata={selected} />}
            </Modal>
        </div>
    );
}