import type { AuthUser } from "@/features/auth/types/auth.types";
import type { RoleProfileConfig } from "@/features/profile/types/profile.types";
import SectionCard from "./sectioncard";

interface RoleExtraInfoProps {
    user: AuthUser;
    config: RoleProfileConfig;
}

const StoreIcon = (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path d="M3 4h14l1 4H2l1-4Zm-1 5h16v7a1 1 0 0 1-1 1h-4v-5H7v5H3a1 1 0 0 1-1-1V9Z" />
    </svg>
);

export default function RoleExtraInfo({ user, config }: RoleExtraInfoProps) {
    const rows = config.extraRows(user);

    if (rows.length === 0) return null;

    return (
        <SectionCard title={`${config.badgeLabel} details`} icon={StoreIcon}>
            <dl className="divide-y divide-gray-100">
                {rows.map((row) => (
                    <div
                        key={row.label}
                        className="flex items-center justify-between gap-4 py-2.5 text-sm"
                    >
                        <dt className="text-gray-500">{row.label}</dt>
                        <dd className="truncate font-medium text-gray-900">{row.value}</dd>
                    </div>
                ))}
            </dl>
        </SectionCard>
    );
}