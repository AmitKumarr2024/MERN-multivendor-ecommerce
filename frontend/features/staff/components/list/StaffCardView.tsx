"use client";

import type { Staff } from "../../types/staff.types";
import StaffCardItem from "./StaffCardItem";

interface StaffCardViewProps {
    roster: Staff[];
    shopId: string;
    onToggleStatus: (id: string, isActive: boolean) => void;
    onRemove: (id: string, name: string) => void;
    onRefetch: () => void;
}

export default function StaffCardView({ roster, shopId, onToggleStatus, onRemove, onRefetch }: StaffCardViewProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {roster.map((member) => (
                <StaffCardItem
                    key={member._id}
                    member={member}
                    shopId={shopId}
                    onToggleStatus={() => onToggleStatus(member._id, member.isActive)}
                    onRemove={() => onRemove(member._id, member.name)}
                    onRefetch={onRefetch}
                />
            ))}
        </div>
    );
}