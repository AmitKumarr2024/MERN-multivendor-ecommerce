import Image from "next/image";

import type { AuthUser } from "@/features/auth/types/auth.types";
import type { RoleProfileConfig } from "@/features/profile/types/profile.types";
import RoleBadge from "./roleBadge";

interface ProfileHeaderProps {
    user: AuthUser;
    config: RoleProfileConfig;
}

function getInitial(name?: string, email?: string): string {
    const source = name?.trim() || email?.trim() || "?";
    return source.charAt(0).toUpperCase();
}

export default function ProfileHeader({
    user,
    config,
}: ProfileHeaderProps) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-default bg-surface p-6">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-xl font-semibold text-accent-foreground">
                {user.avatar ? (
                    <Image
                        src={user.avatar}
                        alt={user.name || "Profile photo"}
                        fill
                        sizes="64px"
                        className="object-cover"
                    />
                ) : (
                    getInitial(user.name, user.email)
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-lg font-semibold text-primary">
                        {user.name || "Unnamed user"}
                    </h1>

                    <RoleBadge
                        role={config.role}
                        label={config.badgeLabel}
                    />
                </div>

                <p className="truncate text-sm text-secondary">
                    {user.email}
                </p>

                {user.phone ? (
                    <p className="truncate text-sm text-secondary">
                        {user.phone}
                    </p>
                ) : null}
            </div>
        </div>
    );
}