"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { StaffCard, selectPublicStaffRoster } from "@/features/staff";
import { fetchPublicStaffRoster } from "@/features/staff/store/staffSlice";
import type { Staff } from "@/features/staff";
import StaffProfileModal from "./components/StaffProfileModal";

interface StaffSectionProps {
    shopId: string;
    shopName: string;
}

export default function StaffSection({ shopId, shopName }: StaffSectionProps) {
    const dispatch = useAppDispatch();
    const staffRoster = useAppSelector(selectPublicStaffRoster);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

    useEffect(() => {
        dispatch(fetchPublicStaffRoster(shopId));
    }, [dispatch, shopId]);

    if (staffRoster.length === 0) return null;

    return (
        <>
            <section className="overflow-hidden rounded-3xl border border-default bg-surface">
                <div className="flex items-center gap-3 border-b border-default px-5 py-4 sm:px-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success-bg text-success-text">
                        <Users className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-primary sm:text-base">
                            Meet the {shopName} team
                        </h2>
                        <p className="text-[11px] text-muted">
                            {staffRoster.length} team member{staffRoster.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 overflow-x-auto px-4 py-4 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-4">
                    {staffRoster.map((member) => (
                        <div key={member._id} className="w-40 shrink-0 sm:w-auto">
                            <StaffCard staff={member} onClick={() => setSelectedStaff(member)} />
                        </div>
                    ))}
                </div>
            </section>

            {selectedStaff && (
                <StaffProfileModal
                    staff={selectedStaff}
                    onClose={() => setSelectedStaff(null)}
                />
            )}
        </>
    );
}