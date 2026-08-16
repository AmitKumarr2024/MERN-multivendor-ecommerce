import type { AuthUser } from "@/features/auth/types/auth.types";
import type { RoleProfileConfig, UserRole } from "@/features/profile/types/profile.types";

/**
 * Single source of truth for "what's different about this
 * role's profile page". Add a new role or a new quick link
 * here — never inside ProfileView's JSX.
 */
export const ROLE_PROFILE_CONFIG: Record<UserRole, RoleProfileConfig> = {
    buyer: {
        role: "buyer",
        badgeLabel: "Buyer",
        extraRows: () => [],
        quickLinks: [
            { label: "My orders", href: "/orders" },
            { label: "Wishlist", href: "/wishlist" },
            { label: "Saved addresses", href: "/profile/addresses" },
        ],
        canSwitchRole: true,
    },

    seller: {
        role: "seller",
        badgeLabel: "Seller",
        extraRows: (user: AuthUser) => [
            {
                label: "Shop",
                value: user.shop ? "Linked" : "Not created yet",
            },
        ],
        quickLinks: [
            { label: "Seller dashboard", href: "/seller/dashboard" },
            { label: "My shop", href: "/seller/shop" },
            { label: "Orders to fulfil", href: "/seller/orders" },
        ],
        // Sellers don't switch back to buyer — role upgrade is one-way.
        canSwitchRole: false,
    },

    admin: {
        role: "admin",
        badgeLabel: "Admin",
        extraRows: () => [],
        quickLinks: [
            { label: "Admin dashboard", href: "/admin/dashboard" },
            { label: "Manage users", href: "/admin/users" },
            { label: "Manage shops", href: "/admin/shops" },
        ],
        // Admins don't self-switch role via the buyer/seller toggle.
        canSwitchRole: false,
    },
};

export function getRoleProfileConfig(role: UserRole | null | undefined): RoleProfileConfig {
    if (role && ROLE_PROFILE_CONFIG[role]) {
        return ROLE_PROFILE_CONFIG[role];
    }
    // Safe fallback — should not normally happen since
    // ProfileView guards on selectIsAuthenticated first.
    return ROLE_PROFILE_CONFIG.buyer;
}