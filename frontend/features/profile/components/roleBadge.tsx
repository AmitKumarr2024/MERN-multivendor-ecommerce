import type { UserRole } from "@/features/profile/types/profile.types";

const ROLE_STYLES: Record<UserRole, string> = {
    buyer: "bg-blue-100 text-blue-700",
    seller: "bg-emerald-100 text-emerald-700",
    admin: "bg-purple-100 text-purple-700",
};

interface RoleBadgeProps {
    role: UserRole;
    label: string;
}

export default function RoleBadge({ role, label }: RoleBadgeProps) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${ROLE_STYLES[role]}`}
        >
            {label}
        </span>
    );
}