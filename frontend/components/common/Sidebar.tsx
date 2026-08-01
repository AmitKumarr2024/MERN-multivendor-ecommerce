"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type {
    ReactNode,
} from "react";


/* =========================================================
   TYPES
========================================================= */

export interface SidebarItem {
    label: string;
    href: string;

    /**
     * Optional icon displayed before the label.
     *
     * Example:
     * icon: <DashboardIcon />
     */
    icon?: ReactNode;

    /**
     * Optional badge.
     *
     * Examples:
     * "5"
     * "New"
     */
    badge?: string | number;

    /**
     * Disable a menu item without removing it.
     */
    disabled?: boolean;
}


interface SidebarProps {
    /**
     * Sidebar heading.
     *
     * Examples:
     * "My Account"
     * "Seller Center"
     * "Admin"
     */
    title?: string;

    /**
     * Optional subtitle below the heading.
     */
    description?: string;

    /**
     * Navigation items.
     */
    items: SidebarItem[];

    /**
     * Optional content displayed at the bottom.
     *
     * Useful for:
     * - Logout
     * - Help
     * - Shop status
     */
    footer?: ReactNode;

    /**
     * Optional extra classes.
     */
    className?: string;
}


/**
 * =========================================================
 * SIDEBAR
 * =========================================================
 *
 * Reusable navigation sidebar.
 *
 * This component contains NO role-specific logic.
 *
 * BuyerSidebar / SellerSidebar / AdminSidebar provide
 * their own menu items.
 *
 * Example:
 *
 * <Sidebar
 *     title="Seller Center"
 *     items={[
 *         {
 *             label: "Dashboard",
 *             href: "/seller/dashboard",
 *         },
 *         {
 *             label: "Products",
 *             href: "/seller/products",
 *         },
 *     ]}
 * />
 *
 * =========================================================
 */

export default function Sidebar({
    title,
    description,
    items,
    footer,
    className = "",
}: SidebarProps) {

    const pathname = usePathname();


    /* =====================================================
       ACTIVE ROUTE
    ===================================================== */

    const isActiveRoute = (
        href: string,
    ) => {

        /*
         * Exact match.
         *
         * /seller/dashboard
         */
        if (pathname === href) {
            return true;
        }


        /*
         * Child route match.
         *
         * href:
         * /seller/products
         *
         * pathname:
         * /seller/products/123
         */
        if (
            href !== "/" &&
            pathname.startsWith(
                `${href}/`,
            )
        ) {
            return true;
        }


        return false;
    };


    return (
        <aside
            className={`
                w-full
                overflow-hidden
                rounded-2xl
                border
                border-zinc-200
                bg-white
                dark:border-zinc-800
                dark:bg-zinc-900
                ${className}
            `}
        >

            {/* =================================================
                HEADER
            ================================================= */}

            {(title || description) && (

                <div className="border-b border-zinc-200 px-4 py-5 dark:border-zinc-800">

                    {title && (

                        <h2 className="text-sm font-black tracking-tight text-zinc-950 dark:text-white">
                            {title}
                        </h2>

                    )}


                    {description && (

                        <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                            {description}
                        </p>

                    )}

                </div>

            )}


            {/* =================================================
                NAVIGATION
            ================================================= */}

            <nav
                aria-label={
                    title
                        ? `${title} navigation`
                        : "Sidebar navigation"
                }
                className="p-2"
            >

                <ul className="space-y-1">

                    {items.map(
                        (item) => {

                            const active =
                                isActiveRoute(
                                    item.href,
                                );


                            return (

                                <li
                                    key={
                                        item.href
                                    }
                                >

                                    {item.disabled ? (

                                        /* =================================
                                           DISABLED ITEM
                                        ================================= */

                                        <div
                                            aria-disabled="true"
                                            className="
                                                flex
                                                cursor-not-allowed
                                                items-center
                                                gap-3
                                                rounded-xl
                                                px-3
                                                py-2.5
                                                text-sm
                                                font-semibold
                                                text-zinc-400
                                                opacity-60
                                                dark:text-zinc-600
                                            "
                                        >

                                            {item.icon && (

                                                <span
                                                    aria-hidden="true"
                                                    className="flex h-5 w-5 shrink-0 items-center justify-center"
                                                >
                                                    {item.icon}
                                                </span>

                                            )}


                                            <span className="min-w-0 flex-1 truncate">
                                                {item.label}
                                            </span>


                                            {item.badge !== undefined && (

                                                <SidebarBadge
                                                    value={
                                                        item.badge
                                                    }
                                                    active={
                                                        false
                                                    }
                                                />

                                            )}

                                        </div>

                                    ) : (

                                        /* =================================
                                           NAVIGATION LINK
                                        ================================= */

                                        <Link
                                            href={
                                                item.href
                                            }
                                            aria-current={
                                                active
                                                    ? "page"
                                                    : undefined
                                            }
                                            className={`
                                                group
                                                flex
                                                items-center
                                                gap-3
                                                rounded-xl
                                                px-3
                                                py-2.5
                                                text-sm
                                                font-semibold
                                                transition
                                                ${active
                                                    ? `
                                                            bg-zinc-950
                                                            text-white
                                                            dark:bg-white
                                                            dark:text-zinc-950
                                                        `
                                                    : `
                                                            text-zinc-600
                                                            hover:bg-zinc-100
                                                            hover:text-zinc-950
                                                            dark:text-zinc-400
                                                            dark:hover:bg-zinc-800
                                                            dark:hover:text-white
                                                        `
                                                }
                                            `}
                                        >

                                            {/* ICON */}

                                            {item.icon && (

                                                <span
                                                    aria-hidden="true"
                                                    className="flex h-5 w-5 shrink-0 items-center justify-center"
                                                >
                                                    {item.icon}
                                                </span>

                                            )}


                                            {/* LABEL */}

                                            <span className="min-w-0 flex-1 truncate">
                                                {item.label}
                                            </span>


                                            {/* BADGE */}

                                            {item.badge !== undefined && (

                                                <SidebarBadge
                                                    value={
                                                        item.badge
                                                    }
                                                    active={
                                                        active
                                                    }
                                                />

                                            )}

                                        </Link>

                                    )}

                                </li>

                            );
                        },
                    )}

                </ul>

            </nav>


            {/* =================================================
                FOOTER
            ================================================= */}

            {footer && (

                <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
                    {footer}
                </div>

            )}

        </aside>
    );
}


/* =========================================================
   BADGE
========================================================= */

interface SidebarBadgeProps {
    value: string | number;
    active: boolean;
}


function SidebarBadge({
    value,
    active,
}: SidebarBadgeProps) {

    return (
        <span
            className={`
                inline-flex
                min-w-5
                shrink-0
                items-center
                justify-center
                rounded-full
                px-1.5
                py-0.5
                text-[10px]
                font-bold
                ${active
                    ? `
                            bg-white/15
                            text-white
                            dark:bg-zinc-950/10
                            dark:text-zinc-950
                        `
                    : `
                            bg-zinc-100
                            text-zinc-500
                            dark:bg-zinc-800
                            dark:text-zinc-400
                        `
                }
            `}
        >
            {value}
        </span>
    );
}