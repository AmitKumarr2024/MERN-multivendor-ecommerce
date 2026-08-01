import type { AuthUser } from "@/features/auth/types/auth.types";

/**
 * Profile feature does NOT own its own user data.
 *
 * It reads from `auth.user` (authSlice) and `passkey.passkeys`
 * (passkeySlice) — both already exist and are populated on
 * login / getMe. There is no separate profile.model on the
 * backend, so there is no separate profile slice either.
 *
 * This file only adds UI-level types on top of AuthUser.
 */

export type UserRole = "buyer" | "seller" | "admin";

/**
 * A single row shown in the "Account info" section.
 * Lets each role plug in extra rows without branching
 * the whole component.
 */
export interface ProfileInfoRow {
    label: string;
    value: string;
}

/**
 * Fields the user is allowed to edit via the
 * "PUT /api/auth/me" (updateMe) thunk.
 *
 * Keep this in sync with UpdateMePayload in
 * features/auth/types/auth.types.ts — duplicated here on
 * purpose so the profile form doesn't need to import backend
 * validation-shaped types directly.
 */
export interface ProfileEditableFields {
    name: string;
    phone?: string;
}

/**
 * Config object per role — drives what extra info/actions
 * ProfileView renders, without needing separate
 * BuyerProfile / SellerProfile / AdminProfile pages.
 */
export interface RoleProfileConfig {
    role: UserRole;
    badgeLabel: string;
    /** Extra read-only rows specific to this role. */
    extraRows: (user: AuthUser) => ProfileInfoRow[];
    /** Quick links shown at the bottom of the profile, role-specific. */
    quickLinks: { label: string; href: string }[];
    /** Whether a "Switch role" action should be offered (buyer<->seller only). */
    canSwitchRole: boolean;
}