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
 * This avoids someone bouncing a shop's orders/listings back
 * and forth by toggling role.
 *
 * A seller with no shop yet (mid-onboarding) is still shown
 * nothing here either — "seller" role with no shop means
 * they're already past the buyer stage, so there's nothing
 * to "switch" into.
 */
export default function ProfileQuickLinks({ config }: ProfileQuickLinksProps) {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectCurrentUser);
    const role = useAppSelector(selectUserRole);
    const loading = useAppSelector(selectAuthLoading);

    const hasShop = Boolean(user?.shop);

    // Only a buyer who hasn't set up a shop yet can become a seller.
    const canUpgradeToSeller =
        config.canSwitchRole && role === "buyer" && !hasShop;

    const handleUpgradeToSeller = () => {
        dispatch(updateMyRole({ role: "seller" }));
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-base font-semibold text-gray-900">Quick links</h2>

            <ul className="space-y-2">
                {config.quickLinks.map((link) => (
                    <li key={link.href}>
                        <Link
                            href={link.href}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
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
                    className="mt-4 w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
                >
                    {loading ? "Switching..." : "Become a seller"}
                </button>
            )}
        </div>
    );
}