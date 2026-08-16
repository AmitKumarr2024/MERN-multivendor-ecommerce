"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    selectAuthInitialized,
    selectCurrentUser,
    selectIsAuthenticated,
    selectUserRole,
} from "@/features/auth/store/authSelector";
import { logoutUser } from "@/features/auth/store/authSlice";
import { fetchMyConversations, selectTotalUnreadCount } from "@/features/messaging";
import { getRoleNavConfig, MAIN_NAV_LINKS } from "../layouts/config/nav.config";
import { fetchMyCart, selectCartItemCount } from "@/features/cart/page";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { NotificationBell } from "@/features/notification";

/**
 * Lean marketplace navbar — one row, minimal icons.
 *
 * Deliberately NOT included (add back only if you actually
 * need it, don't default to it):
 * - separate "discovery" category strip under the navbar
 * - gradient/decorative logo styling
 *
 * Role-specific routing still comes from nav.config.ts.
 *
 * Dark mode:
 * All colors use semantic tokens (bg-surface, text-primary,
 * border-default, etc.) defined in globals.css instead of raw
 * Tailwind grays — see the token table there. This is what
 * makes the whole navbar respond to the "dark" class on <html>
 * without needing dark: prefixes everywhere.
 */
export default function Navbar() {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const initialized = useAppSelector(selectAuthInitialized);
    const user = useAppSelector(selectCurrentUser);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const role = useAppSelector(selectUserRole);
    const unread = useAppSelector(selectTotalUnreadCount(role === "seller"));

    const [mounted, setMounted] = useState(false);
    const [search, setSearch] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);

    const cartCount = useAppSelector(selectCartItemCount);

    const accountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => setMounted(true), []);
    const authReady = mounted && initialized;
    const navConfig = getRoleNavConfig(role);

    useEffect(() => {
        if (!authReady || !isAuthenticated) return;

        dispatch(fetchMyConversations());
        dispatch(fetchMyCart());
    }, [dispatch, authReady, isAuthenticated]);
    useEffect(() => {
        if (!accountOpen) return;
        const onClick = (e: MouseEvent) => {
            if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
                setAccountOpen(false);
            }
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [accountOpen]);

    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const q = search.trim();
        if (!q) return;
        router.push(`/search?q=${encodeURIComponent(q)}`);
        setMenuOpen(false);
    };

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            setAccountOpen(false);
            setMenuOpen(false);
            router.replace("/");
            router.refresh();
        } catch (err) {
            console.error("Unable to logout:", err);
        }
    };

    const messagesHref = role === "seller" ? "/seller/messages" : "/buyer/messages";

    return (
        <header className="sticky top-0 z-50 border-b border-default bg-surface">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex shrink-0 items-center gap-2 font-bold text-primary"
                >
                    <Image
                        src="/android-chrome-512x512.png"
                        alt="Amitora Market"
                        width={52}
                        height={52}
                        className="rounded-lg object-contain"
                    />

                    <span className="hidden sm:inline">
                        Amitora Market
                    </span>
                </Link>

                {/* Desktop links */}
                <nav className="hidden items-center gap-1 md:flex">
                    {MAIN_NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="rounded-md px-3 py-2 text-sm font-medium text-secondary hover:bg-surface-hover hover:text-primary"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Search (desktop) */}
                <form onSubmit={handleSearch} className="ml-auto hidden max-w-sm flex-1 lg:block">
                    <div className="relative">
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products..."
                            className="h-10 w-full rounded-lg border border-strong bg-surface-muted pl-9 pr-3 text-sm text-primary outline-none focus:border-accent focus:bg-surface"
                        />
                        <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                        >
                            <path
                                fillRule="evenodd"
                                d="M9 3.5a5.5 5.5 0 1 0 3.61 9.65l3.62 3.62a.75.75 0 1 0 1.06-1.06l-3.62-3.62A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </form>

                {/* Right side actions (desktop) */}
                <div className="hidden items-center gap-2 md:flex">
                    <ThemeToggle />

                    {isAuthenticated && (
                        <Link
                            href={messagesHref}
                            className="relative flex h-9 w-9 items-center justify-center rounded-md text-secondary hover:bg-surface-hover"
                            aria-label="Messages"
                        >
                            <MessageIcon />
                            {unread > 0 && (
                                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                                    {unread}
                                </span>
                            )}
                        </Link>
                    )}
                    {isAuthenticated && <NotificationBell />}
                    <Link
                        href="/buyer/cart"
                        className="relative flex h-9 w-9 items-center justify-center rounded-md text-secondary hover:bg-surface-hover"
                        aria-label="Cart"
                    >
                        <CartIcon />

                        {cartCount > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {!authReady ? (
                        <div className="h-9 w-24 animate-pulse rounded-md bg-surface-hover" />
                    ) : isAuthenticated ? (
                        <div ref={accountRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setAccountOpen((v) => !v)}
                                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-primary hover:bg-surface-hover"
                            >
                                <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                                    {user?.avatar ? (
                                        <Image
                                            src={user.avatar}
                                            alt={user?.name || "Account"}
                                            fill
                                            sizes="28px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        getInitials(user?.name ?? "A")
                                    )}
                                </span>
                                <span className="hidden max-w-20 truncate lg:inline">
                                    {user?.name?.split(" ")[0] ?? "Account"}
                                </span>
                            </button>

                            {accountOpen && (
                                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-default bg-surface py-1 shadow-lg">
                                    <div className="border-b border-default px-3 py-2">
                                        <p className="truncate text-sm font-medium text-primary">
                                            {user?.name}
                                        </p>
                                        <p className="truncate text-xs text-secondary">{user?.email}</p>
                                    </div>

                                    <Link
                                        href={navConfig.profileHref}
                                        onClick={() => setAccountOpen(false)}
                                        className="block px-3 py-2 text-sm text-primary hover:bg-surface-hover"
                                    >
                                        My Profile
                                    </Link>

                                    {navConfig.extraMenuItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setAccountOpen(false)}
                                            className="block px-3 py-2 text-sm text-primary hover:bg-surface-hover"
                                        >
                                            {item.label}
                                        </Link>
                                    ))}

                                    {navConfig.ordersHref && (
                                        <Link
                                            href={navConfig.ordersHref}
                                            onClick={() => setAccountOpen(false)}
                                            className="block px-3 py-2 text-sm text-primary hover:bg-surface-hover"
                                        >
                                            {navConfig.ordersLabel}
                                        </Link>
                                    )}

                                    <Link
                                        href="/buyer/wishlist"
                                        onClick={() => setAccountOpen(false)}
                                        className="block px-3 py-2 text-sm text-primary hover:bg-surface-hover"
                                    >
                                        Wishlist
                                    </Link>

                                    <div className="my-1 border-t border-default" />

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-surface-hover"
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
                            >
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile toggle */}
                <div className="ml-auto flex items-center gap-1 md:hidden">
                    {isAuthenticated && (
                        <Link
                            href={messagesHref}
                            className="relative flex h-9 w-9 items-center justify-center rounded-md text-secondary"
                            aria-label="Messages"
                        >
                            <MessageIcon />
                            {unread > 0 && (
                                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-semibold text-white">
                                    {unread}
                                </span>
                            )}
                        </Link>
                    )}
                    {isAuthenticated && <NotificationBell />}
                    <Link
                        href="/buyer/cart"
                        className="flex h-9 w-9 items-center justify-center rounded-md text-secondary"
                        aria-label="Cart"
                    >
                        <CartIcon />
                    </Link>
                    <button
                        type="button"
                        onClick={() => setMenuOpen((v) => !v)}
                        className="flex h-9 w-9 items-center justify-center rounded-md text-primary hover:bg-surface-hover"
                        aria-label="Menu"
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>
                </div>
            </div>

            {/* Mobile search - always visible below the bar on small screens */}
            <form onSubmit={handleSearch} className="border-t border-default px-4 py-2 lg:hidden">
                <div className="relative">
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="h-10 w-full rounded-lg border border-strong bg-surface-muted pl-9 pr-3 text-sm text-primary outline-none focus:border-accent focus:bg-surface"
                    />
                    <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                    >
                        <path
                            fillRule="evenodd"
                            d="M9 3.5a5.5 5.5 0 1 0 3.61 9.65l3.62 3.62a.75.75 0 1 0 1.06-1.06l-3.62-3.62A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            </form>

            {/* Mobile menu — simple dropdown, not a full overlay panel */}
            {menuOpen && (
                <div className="border-t border-default bg-surface md:hidden">
                    <nav className="space-y-0.5 px-2 py-2">
                        {MAIN_NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="block rounded-md px-3 py-2.5 text-sm font-medium text-primary hover:bg-surface-hover"
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="my-1 border-t border-default" />

                        {/* Theme switch — mobile menu */}
                        <div className="flex items-center justify-between px-3 py-2">
                            <span className="text-sm font-medium text-primary">Theme</span>
                            <ThemeToggle />
                        </div>

                        <div className="my-1 border-t border-default" />

                        {!authReady ? (
                            <div className="space-y-2 px-3 py-2">
                                <div className="h-9 w-full animate-pulse rounded-md bg-surface-hover" />
                            </div>
                        ) : isAuthenticated ? (
                            <>
                                <div className="px-3 py-2">
                                    <p className="truncate text-sm font-medium text-primary">
                                        {user?.name}
                                    </p>
                                    <p className="truncate text-xs text-secondary">{user?.email}</p>
                                </div>

                                <Link
                                    href={navConfig.profileHref}
                                    onClick={() => setMenuOpen(false)}
                                    className="block rounded-md px-3 py-2.5 text-sm text-primary hover:bg-surface-hover"
                                >
                                    My Profile
                                </Link>

                                {navConfig.extraMenuItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMenuOpen(false)}
                                        className="block rounded-md px-3 py-2.5 text-sm text-primary hover:bg-surface-hover"
                                    >
                                        {item.label}
                                    </Link>
                                ))}

                                {navConfig.ordersHref && (
                                    <Link
                                        href={navConfig.ordersHref}
                                        onClick={() => setMenuOpen(false)}
                                        className="block rounded-md px-3 py-2.5 text-sm text-primary hover:bg-surface-hover"
                                    >
                                        {navConfig.ordersLabel}
                                    </Link>
                                )}

                                <Link
                                    href="/buyer/wishlist"
                                    onClick={() => setMenuOpen(false)}
                                    className="block rounded-md px-3 py-2.5 text-sm text-primary hover:bg-surface-hover"
                                >
                                    Wishlist
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="block w-full rounded-md px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                >
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-2 px-3 py-2">
                                <Link
                                    href="/login"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex-1 rounded-md border border-strong py-2 text-center text-sm font-medium text-primary"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex-1 rounded-md bg-accent py-2 text-center text-sm font-medium text-accent-foreground"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "A";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function MessageIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path
                d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8a9.5 9.5 0 0 1-2.8-.4L4 21l1.3-3.8A7.9 7.9 0 0 1 4 12Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function CartIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path
                d="M3.5 5H5.5L7.3 14C7.5 15 8.4 15.7 9.4 15.7H17.3C18.3 15.7 19.1 15.1 19.4 14.1L21 8H6.2"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="9.5" cy="19" r="1.3" fill="currentColor" />
            <circle cx="18" cy="19" r="1.3" fill="currentColor" />
        </svg>
    );
}

function MenuIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}