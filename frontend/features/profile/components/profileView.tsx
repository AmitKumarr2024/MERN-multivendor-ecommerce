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

/**
 * ONE profile page for buyer, seller, and admin.
 *
 * Usage — same import, works everywhere:
 *
 *   app/(buyer)/profile/page.tsx   -> <ProfileView />
 *   app/seller/profile/page.tsx  -> <ProfileView />  (if you add one)
 *   app/admin/profile/page.tsx   -> <ProfileView />  (if you add one)
 *
 * What changes per role is driven entirely by
 * ROLE_PROFILE_CONFIG (features/profile/config), not by
 * separate components or if/else chains here.
 */
export default function ProfileView() {
    const initialized = useAppSelector(selectAuthInitialized);
    const user = useAppSelector(selectCurrentUser);
    const role = useAppSelector(selectUserRole);

    if (!initialized) {
        return (
            <div className="mx-auto max-w-3xl p-6">
                <p className="text-sm text-muted">Loading profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="mx-auto max-w-3xl p-6">
                <p className="text-sm text-secondary">
                    You need to be logged in to view this page.
                </p>
            </div>
        );
    }

    const config = getRoleProfileConfig(role);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">

            {/* Header */}
            <ProfileHeader
                user={user}
                config={config}
            />

            <div className="mt-8 grid gap-8 lg:grid-cols-12">

                {/* Main Content */}
                <main className="space-y-8 lg:col-span-8">

                    <ProfileInfoForm />

                    <RoleExtraInfo
                        user={user}
                        config={config}
                    />

                    <section className="space-y-6 rounded-2xl border border-default bg-surface p-6 shadow-sm">

                        <h2 className="text-lg font-semibold text-primary">
                            Security
                        </h2>

                        <ChangePasswordForm />

                        <PasskeyManager />

                    </section>

                </main>

                {/* Sidebar */}
                <aside className="space-y-6 lg:col-span-4">

                    <ProfileQuickLinks
                        config={config}
                    />

                </aside>

            </div>

        </div>
    );
}