"use client";

import { useAppSelector } from "@/store/hooks";
import {
    selectAuthInitialized,
    selectCurrentUser,
    selectUserRole,
} from "@/features/auth/store/authSelector";
import { getRoleProfileConfig } from "@/features/profile/config/role-profile.config";

import ProfileHeader from "./profileHeader";
import ProfileInfoForm from "./profileInfoForm";
import RoleExtraInfo from "./roleExtraInfo";
import ChangePasswordForm from "./changePasswordForm";
import PasskeyManager from "./passkeyManager";
import ProfileQuickLinks from "./profileQuickLinks";

export default function ProfileView() {
    const initialized = useAppSelector(
        selectAuthInitialized,
    );

    const user = useAppSelector(
        selectCurrentUser,
    );

    const role = useAppSelector(
        selectUserRole,
    );

    if (!initialized) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="space-y-4">
                    <div className="h-28 animate-pulse rounded-3xl bg-surface-muted" />
                    <div className="h-64 animate-pulse rounded-3xl bg-surface-muted" />
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-md rounded-3xl border border-default bg-surface p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-muted">
                        <span className="text-lg">!</span>
                    </div>

                    <h1 className="mt-4 text-lg font-bold text-primary">
                        Sign in required
                    </h1>

                    <p className="mt-2 text-sm text-secondary">
                        You need to be logged in to view your profile.
                    </p>
                </div>
            </div>
        );
    }

    const config = getRoleProfileConfig(role);

    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

                {/* =====================================================
                    PROFILE HEADER
                ===================================================== */}

                <ProfileHeader
                    user={user}
                    config={config}
                />

                {/* =====================================================
                    MAIN LAYOUT
                ===================================================== */}

                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">

                    {/* =================================================
                        MAIN
                    ================================================= */}

                    <main className="min-w-0 space-y-6">

                        <ProfileInfoForm />

                        <RoleExtraInfo
                            user={user}
                            config={config}
                        />

                        {/* Security */}
                        <section
                            className="
                                overflow-hidden
                                rounded-3xl
                                border
                                border-default
                                bg-surface
                            "
                        >
                            <div
                                className="
                                    border-b
                                    border-default
                                    px-5
                                    py-5
                                    sm:px-6
                                "
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="
                                            flex
                                            h-10
                                            w-10
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-accent/10
                                            text-accent
                                        "
                                    >
                                        🔐
                                    </div>

                                    <div>
                                        <h2 className="text-base font-bold text-primary">
                                            Security
                                        </h2>

                                        <p className="mt-0.5 text-xs text-muted">
                                            Protect your account and manage
                                            sign-in methods.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="divide-y divide-default">
                                <ChangePasswordForm />

                                <PasskeyManager />
                            </div>
                        </section>
                    </main>

                    {/* =================================================
                        SIDEBAR
                    ================================================= */}

                    <aside className="min-w-0 space-y-6 lg:sticky lg:top-6 lg:self-start">
                        <ProfileQuickLinks
                            config={config}
                        />
                    </aside>
                </div>
            </div>
        </div>
    );
}