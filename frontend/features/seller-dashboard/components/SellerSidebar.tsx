"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser } from "@/features/auth/store/authSelector";

const NAV_ITEMS = [
    {
        href: "/seller/dashboard",
        label: "Dashboard",
        icon: HomeIcon,
    },
    {
        href: "/seller/products",
        label: "Products",
        icon: BoxIcon,
    },
    {
        href: "/seller/orders",
        label: "Orders",
        icon: ClipboardIcon,
    },
   
    {
        href: "/seller/messages",
        label: "Messages",
        icon: ChatIcon,
    },
] as const;

interface SellerSidebarProps {
    children: React.ReactNode;
}

export default function SellerSidebar({
    children,
}: SellerSidebarProps) {
    const pathname = usePathname();

    const user = useAppSelector(selectCurrentUser);

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    /*
     * Dynamic seller information
     */
    const userName = user?.name || "Seller";

    const initials = userName
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();

    /*
     * Restore sidebar state
     */
    useEffect(() => {
        const saved = localStorage.getItem(
            "sellerSidebarCollapsed",
        );

        if (saved === "1") {
            setCollapsed(true);
        }
    }, []);

    /*
     * Toggle desktop sidebar
     */
    const toggleCollapsed = () => {
        setCollapsed((prev) => {
            const next = !prev;

            localStorage.setItem(
                "sellerSidebarCollapsed",
                next ? "1" : "0",
            );

            return next;
        });
    };

    return (
        <div className="flex min-h-screen">
            {/* =====================================================
                MOBILE BACKDROP
            ====================================================== */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* =====================================================
                SIDEBAR
            ====================================================== */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col border-r border-default bg-surface transition-all duration-200 lg:sticky lg:top-[70px] lg:z-30 lg:h-[calc(100vh-70px)] lg:translate-x-0 ${mobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                    } ${collapsed
                        ? "w-[76px] p-3"
                        : "w-64 p-4"
                    }`}
            >
                {/* =================================================
                    COLLAPSE TOGGLE
                ================================================== */}
                <button
                    type="button"
                    onClick={toggleCollapsed}
                    className={`mb-3 hidden items-center gap-2 rounded-lg border border-default px-3 py-2 text-xs font-semibold text-secondary transition-colors hover:bg-surface-hover hover:text-primary lg:flex ${collapsed ? "justify-center" : ""
                        }`}
                    aria-label={
                        collapsed
                            ? "Expand sidebar"
                            : "Collapse sidebar"
                    }
                >
                    <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${collapsed ? "rotate-180" : ""
                            }`}
                    >
                        <path
                            d="M12 4l-6 6 6 6"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>

                    {!collapsed && "Collapse"}
                </button>

                {/* =================================================
                    NAVIGATION
                ================================================== */}
                <nav className="flex-1 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map(
                        ({
                            href,
                            label,
                            icon: Icon,
                        }) => {
                            const active =
                                pathname === href ||
                                pathname?.startsWith(
                                    `${href}/`,
                                );

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() =>
                                        setMobileOpen(false)
                                    }
                                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${collapsed
                                        ? "justify-center"
                                        : ""
                                        } ${active
                                            ? "bg-accent text-accent-foreground"
                                            : "text-secondary hover:bg-surface-hover hover:text-primary"
                                        }`}
                                >
                                    <Icon className="h-[18px] w-[18px] shrink-0" />

                                    {!collapsed && (
                                        <span>{label}</span>
                                    )}

                                    {/* Tooltip when collapsed */}
                                    {collapsed && (
                                        <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100 lg:block">
                                            {label}
                                        </span>
                                    )}
                                </Link>
                            );
                        },
                    )}
                </nav>

                {/* =================================================
                    DYNAMIC SELLER USER FOOTER
                ================================================== */}
                <div
                    className={`mt-auto border-t border-default pt-3 ${collapsed
                        ? "flex justify-center"
                        : ""
                        }`}
                >
                    <div
                        className={`flex items-center gap-2.5 rounded-lg p-2 hover:bg-surface-hover ${collapsed
                            ? "justify-center"
                            : ""
                            }`}
                    >
                        {/* Dynamic initials */}
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-purple-400 text-xs font-bold text-accent-foreground">
                            {initials}
                        </span>

                        {!collapsed && (
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-primary">
                                    {userName}
                                </p>

                                <p className="truncate text-xs text-muted">
                                    Seller Account
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* =====================================================
                MAIN CONTENT
            ====================================================== */}
            <div className="min-w-0 flex-1">
                {/* =================================================
                    MOBILE TOP BAR
                ================================================== */}
                <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-default bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
                    <button
                        type="button"
                        onClick={() =>
                            setMobileOpen(true)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-default text-secondary hover:bg-surface-hover"
                        aria-label="Open menu"
                    >
                        <svg
                            viewBox="0 0 20 20"
                            fill="none"
                            className="h-[18px] w-[18px]"
                        >
                            <path
                                d="M3 6h14M3 10h14M3 14h14"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}

/* =========================================================
   ICONS
========================================================= */

function HomeIcon({
    className,
}: {
    className?: string;
}) {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M3 10l7-7 7 7M5 8.5V17h10V8.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function BoxIcon({
    className,
}: {
    className?: string;
}) {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M3 6.5l7-3.5 7 3.5-7 3.5-7-3.5zm0 0v7l7 3.5m0-10.5v10.5m7-10.5v7l-7 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function ClipboardIcon({
    className,
}: {
    className?: string;
}) {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            className={className}
            aria-hidden="true"
        >
            <rect
                x="4"
                y="3"
                width="12"
                height="14"
                rx="1.5"
                stroke="currentColor"
                strokeWidth="1.5"
            />

            <path
                d="M7 3V2h6v1M7 9h6M7 12h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

function StoreIcon({
    className,
}: {
    className?: string;
}) {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M3 8l1-4h12l1 4M3 8v7a1 1 0 001 1h3v-5h6v5h3a1 1 0 001-1V8M3 8h14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function ChatIcon({
    className,
}: {
    className?: string;
}) {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8a9.5 9.5 0 01-2.8-.4L4 21l1.3-3.8A7.9 7.9 0 014 12z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                transform="scale(0.85) translate(1.5,1)"
            />
        </svg>
    );
}