"use client";

import { useEffect, useState } from "react";
import { Users, ChevronRight } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    StaffCard,
    StaffProfileModal,
    selectPublicStaffRoster,
} from "@/features/staff";
import { fetchPublicStaffRoster } from "@/features/staff/store/staffSlice";
import type { Staff } from "@/features/staff";

interface StaffSectionProps {
    shopId: string;
    shopName: string;
}

export default function StaffSection({
    shopId,
    shopName,
}: StaffSectionProps) {
    const dispatch = useAppDispatch();

    const staffRoster = useAppSelector(selectPublicStaffRoster);

    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

    useEffect(() => {
        dispatch(fetchPublicStaffRoster(shopId));
    }, [dispatch, shopId]);

    if (staffRoster.length === 0) return null;

    return (
        <>
            <section className="overflow-hidden rounded-2xl border border-default bg-surface">
                {/* =====================================================
                    HEADER
                   ===================================================== */}
                <div className="flex items-center gap-3 border-b border-default px-4 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success-bg text-success-text">
                        <Users className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-bold text-primary">
                            {shopName} Team
                        </h2>

                        <p className="mt-0.5 text-[11px] text-muted">
                            {staffRoster.length} team member
                            {staffRoster.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                {/* =====================================================
                    STAFF LIST
                   ===================================================== */}
                <div className="divide-y divide-default">
                    {staffRoster.map((member) => (
                        <StaffCard
                            key={member._id}
                            staff={member}
                            onClick={() => setSelectedStaff(member)}
                        />
                    ))}
                </div>
            </section>

            {/* =========================================================
                STAFF PROFILE MODAL
               ========================================================= */}
            {selectedStaff && (
                <StaffProfileModal
                    staff={selectedStaff}
                    onClose={() => setSelectedStaff(null)}
                />
            )}
        </>
    );
}