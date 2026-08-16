export interface NavLinkItem {
    label: string;
    href: string;
}

/* =========================================================
   TOP-LEVEL NAV LINKS (desktop nav + mobile menu)
========================================================= */

export const MAIN_NAV_LINKS: NavLinkItem[] = [
    { label: "Home", href: "/" },
    { label: "Shops", href: "/shop" },
    { label: "Categories", href: "/categories" },
    { label: "Deals", href: "/deals" },
];

/* =========================================================
   DISCOVERY / CATEGORY STRIP
========================================================= */

export const CATEGORY_STRIP_LINKS: NavLinkItem[] = [
    { label: "Electronics", href: "/categories/electronics" },
    { label: "Fashion", href: "/categories/fashion" },
    { label: "Home & Living", href: "/categories/home" },
    { label: "Beauty", href: "/categories/beauty" },
    { label: "Sports", href: "/categories/sports" },
    { label: "Accessories", href: "/categories/accessories" },
];

/* =========================================================
   ROLE-BASED ACCOUNT ROUTES
   ------------------------------------------------------------------
   Add a new role (e.g. "admin") or a new per-role menu item here.
   Navbar.tsx just reads this config — it never branches on role
   directly, so growing to more roles doesn't touch the component.
========================================================= */

export type NavRole = "buyer" | "seller" | "admin";

export interface RoleNavConfig {
    /** Personal profile route for this role. */
    profileHref: string;
    /** "My orders" (buyer) vs "Orders received" (seller) vs n/a (admin). */
    ordersHref: string | null;
    ordersLabel: string;
    /** Badge text shown at the top of the account dropdown. */
    accountBadge: string;
    /** Extra menu items unique to this role, shown between Profile and Orders. */
    extraMenuItems: (NavLinkItem & { icon: "dashboard" | "shop" | "users" })[];
    /** Primary CTA button shown in the navbar (e.g. "Seller Center"). */
    cta: NavLinkItem | null;
}

export const ROLE_NAV_CONFIG: Record<NavRole, RoleNavConfig> = {
    buyer: {
        profileHref: "/buyer/profile",
        ordersHref: "/buyer/orders",
        ordersLabel: "My Orders",
        accountBadge: "Buyer Account",
        extraMenuItems: [],
        cta: { label: "Start Selling", href: "/seller/register" },
    },

    seller: {
        profileHref: "/seller/profile",
        ordersHref: "/seller/orders",
        ordersLabel: "Seller Orders",
        accountBadge: "Seller Account",
        extraMenuItems: [
            { label: "Seller Dashboard", href: "/seller/dashboard", icon: "dashboard" },
            { label: "My Shop", href: "/seller/shop", icon: "shop" },
        ],
        cta: { label: "Seller Center", href: "/seller/dashboard" },
    },

    admin: {
        profileHref: "/admin/profile",
        ordersHref: "/admin/orders",
        ordersLabel: "All Orders",
        accountBadge: "Admin Account",
        extraMenuItems: [
            { label: "Admin Dashboard", href: "/admin/dashboard", icon: "dashboard" },
            { label: "Manage Users", href: "/admin/users", icon: "users" },
        ],
        cta: { label: "Admin Panel", href: "/admin/dashboard" },
    },
};

/** Guest (not logged in) CTA — separate since there's no role yet. */
export const GUEST_SELLER_CTA: NavLinkItem = {
    label: "Start Selling",
    href: "/login",
};

export function getRoleNavConfig(role: NavRole | null | undefined): RoleNavConfig {
    if (role && ROLE_NAV_CONFIG[role]) return ROLE_NAV_CONFIG[role];
    return ROLE_NAV_CONFIG.buyer;
}