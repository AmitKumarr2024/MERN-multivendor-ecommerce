"use client";

import Link from "next/link";
import {
    ArrowRight,
    ExternalLink,
    Store,
} from "lucide-react";

import {
    useAppDispatch,
    useAppSelector,
} from "@/store/hooks";

import {
    updateMyRole,
} from "@/features/auth/store/authSlice";

import {
    selectAuthLoading,
    selectCurrentUser,
    selectUserRole,
} from "@/features/auth/store/authSelector";

import type {
    RoleProfileConfig,
} from "@/features/profile/types/profile.types";

interface ProfileQuickLinksProps {
    config: RoleProfileConfig;
}

export default function ProfileQuickLinks({
    config,
}: ProfileQuickLinksProps) {
    const dispatch = useAppDispatch();

    const user = useAppSelector(
        selectCurrentUser,
    );

    const role = useAppSelector(
        selectUserRole,
    );

    const loading = useAppSelector(
        selectAuthLoading,
    );

    const hasShop = Boolean(
        user?.shop,
    );

    const canUpgradeToSeller =
        config.canSwitchRole &&
        role === "buyer" &&
        !hasShop;

    const handleUpgradeToSeller =
        () => {
            dispatch(
                updateMyRole({
                    role: "seller",
                }),
            );
        };

    return (
        <div className="space-y-4">

            {/* Quick links */}
            <section className="overflow-hidden rounded-3xl border border-default bg-surface">
                <div className="border-b border-default px-5 py-4">
                    <h2 className="text-sm font-bold text-primary">
                        Account shortcuts
                    </h2>

                    <p className="mt-0.5 text-xs text-muted">
                        Quickly access your marketplace tools.
                    </p>
                </div>

                <div className="p-3">
                    <div className="grid gap-1">
                        {config.quickLinks.map(
                            (link) => (
                                <Link
                                    key={
                                        link.href
                                    }
                                    href={
                                        link.href
                                    }
                                    className="
                                        group
                                        flex
                                        items-center
                                        gap-3
                                        rounded-2xl
                                        px-3
                                        py-3
                                        transition-colors
                                        hover:bg-surface-hover
                                    "
                                >
                                    <div
                                        className="
                                            flex
                                            h-9
                                            w-9
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-surface-muted
                                            text-secondary
                                            transition-colors
                                            group-hover:bg-accent/10
                                            group-hover:text-accent
                                        "
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </div>

                                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-primary">
                                        {
                                            link.label
                                        }
                                    </span>

                                    <ArrowRight
                                        className="
                                            h-4
                                            w-4
                                            shrink-0
                                            text-muted
                                            transition-transform
                                            group-hover:translate-x-0.5
                                            group-hover:text-primary
                                        "
                                    />
                                </Link>
                            ),
                        )}
                    </div>
                </div>
            </section>


        </div>
    );
}