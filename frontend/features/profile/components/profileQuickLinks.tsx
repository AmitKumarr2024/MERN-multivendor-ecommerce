"use client";

import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateMyRole } from "@/features/auth/store/authSlice";
import {
    selectAuthLoading,
    selectCurrentUser,
    selectUserRole,
} from "@/features/auth/store/authSelector";
import type { RoleProfileConfig } from "@/features/profile/types/profile.types";

interface ProfileQuickLinksProps {
    config: RoleProfileConfig;
}

/**
 * Role switching is intentionally ONE-WAY: buyer -> seller only.
 *
 * Once someone has actually registered/set up as a seller
 * (i.e. `user.shop` exists), they've committed to that
 * account — there's no "switch back to buyer" option anymore.
 *
 * A seller with no shop yet (mid-onboarding) is still shown
 * nothing here either.
 */
export default function ProfileQuickLinks({
    config,
}: ProfileQuickLinksProps) {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectCurrentUser);
    const role = useAppSelector(selectUserRole);
    const loading = useAppSelector(selectAuthLoading);

    const hasShop = Boolean(user?.shop);

    const canUpgradeToSeller =
        config.canSwitchRole && role === "buyer" && !hasShop;

    const handleUpgradeToSeller = () => {
        dispatch(updateMyRole({ role: "seller" }));
    };

    return (
        <div className="rounded-xl border border-default bg-surface p-6">
            <h2 className="mb-4 text-base font-semibold text-primary">
                Quick links
            </h2>

            <ul className="space-y-2">
                {config.quickLinks.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className="text-sm font-medium text-info-text transition-opacity hover:opacity-80"
                        >
                            {link.label} →
                        </Link>
                    </li>
                ))}
            </ul>

            {canUpgradeToSeller && (
                <button
                    type="button"
                    onClick={handleUpgradeToSeller}
                    disabled={loading}
                    className="mt-4 w-full rounded-md border border-default px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-surface-hover disabled:opacity-50"
                >
                    {loading ? "Switching..." : "Become a seller"}
                </button>
            )}
        </div>
    );
}