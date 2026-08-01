"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAppSelector } from "@/store/hooks";
import {
    selectAuthInitialized,
    selectCurrentUser,
    selectUserRole,
} from "@/features/auth/store/authSelector";
import type { UserRole } from "@/features/profile/types/profile.types";

interface RequireRoleProps {
    /** Roles allowed to view this page. */
    allow: UserRole[];
    /** Where to send someone who's logged in but has the wrong role. */
    redirectTo?: string;
    children: React.ReactNode;
}

/**
 * Wrap any (buyer)/(seller)/(admin) page with this to keep
 * people out of profile sections that aren't theirs — e.g. a
 * buyer typing /(admin)/profile directly in the URL bar.
 *
 * Not a security boundary by itself (that's the backend's
 * job) — just keeps the UI honest and avoids flash-of-wrong-
 * content.
 */
export default function RequireRole({
    allow,
    redirectTo = "/login",
    children,
}: RequireRoleProps) {
    const router = useRouter();

    const initialized = useAppSelector(selectAuthInitialized);
    const user = useAppSelector(selectCurrentUser);
    const role = useAppSelector(selectUserRole);

    useEffect(() => {
        if (!initialized) return;

        if (!user) {
            router.replace(redirectTo);
            return;
        }

        if (role && !allow.includes(role)) {
            // Logged in, just the wrong section — send them home
            // instead of to login.
            router.replace("/");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialized, user, role]);

    if (!initialized) {
        return (
            <div className="mx-auto max-w-3xl p-6">
                <p className="text-sm text-gray-400">Loading...</p>
            </div>
        );
    }

    if (!user || (role && !allow.includes(role))) {
        // Redirect effect above will fire; render nothing meanwhile.
        return null;
    }

    return <>{children}</>;
}