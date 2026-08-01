"use client";

import Link from "next/link";
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
import { getRoleNavConfig, MAIN_NAV_LINKS } from "../layouts/config/nav.config";

/**
 * Lean marketplace navbar — one row, minimal icons.
 *
 * Deliberately NOT included (add back only if you actually
 * need it, don't default to it):
 * - separate "discovery" category strip under the navbar
 * - notification bell
 * - wishlist icon in the top bar (still reachable via account menu)
 * - gradient/decorative logo styling
 *
 * Role-specific routing still comes from nav.config.ts.
 */
export default function Navbar() {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const initialized = useAppSelector(selectAuthInitialized);
    const user = useAppSelector(selectCurrentUser);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const role = useAppSelector(selectUserRole);

    const [mounted, setMounted] = useState(false);
    const [search, setSearch] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);

    const accountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => setMounted(true), []);
    const authReady = mounted && initialized;
    const navConfig = getRoleNavConfig(role);

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

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-gray-900">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-sm text-white">
                        M
                    </span>
                    <span className="hidden sm:inline">Marketplace</span>
                </Link>

                {/* Desktop links */}
                <nav className="hidden items-center gap-1 md:flex">
                    {MAIN_NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
                            className="h-10 w-full rounded-lg border border-gray-300 bg-gray-50 pl-9 pr-3 text-sm outline-none focus:border-gray-900 focus:bg-white"
                        />
                        <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
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
                    <Link
                        href="/cart"
                        className="relative flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
                        aria-label="Cart"
                    >
                        <CartIcon />
                        {/* TODO: wire to cart slice item count */}
                    </Link>

                    {!authReady ? (
                        <div className="h-9 w-24 animate-pulse rounded-md bg-gray-100" />
                    ) : isAuthenticated ? (
                        <div ref={accountRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setAccountOpen((v) => !v)}
                                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                            >
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                                    {getInitials(user?.name ?? "A")}
                                </span>
                                <span className="hidden max-w-20 truncate lg:inline">
                                    {user?.name?.split(" ")[0] ?? "Account"}
                                </span>
                            </button>

                            {accountOpen && (
                                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                                    <div className="border-b border-gray-100 px-3 py-2">
                                        <p className="truncate text-sm font-medium text-gray-900">
                                            {user?.name}
                                        </p>
                                        <p className="truncate text-xs text-gray-500">{user?.email}</p>
                                    </div>

                                    <Link
                                        href={navConfig.profileHref}
                                        onClick={() => setAccountOpen(false)}
                                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        My Profile
                                    </Link>

                                    {navConfig.extraMenuItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setAccountOpen(false)}
                                            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            {item.label}
                                        </Link>
                                    ))}

                                    {navConfig.ordersHref && (
                                        <Link
                                            href={navConfig.ordersHref}
                                            onClick={() => setAccountOpen(false)}
                                            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            {navConfig.ordersLabel}
                                        </Link>
                                    )}

                                    <Link
                                        href="/wishlist"
                                        onClick={() => setAccountOpen(false)}
                                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        Wishlist
                                    </Link>

                                    <div className="my-1 border-t border-gray-100" />

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
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
                                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
                            >
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile toggle */}
                <div className="ml-auto flex items-center gap-1 md:hidden">
                    <Link
                        href="/cart"
                        className="flex h-9 w-9 items-center justify-center rounded-md text-gray-600"
                        aria-label="Cart"
                    >
                        <CartIcon />
                    </Link>
                    <button
                        type="button"
                        onClick={() => setMenuOpen((v) => !v)}
                        className="flex h-9 w-9 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100"
                        aria-label="Menu"
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>
                </div>
            </div>

            {/* Mobile search - always visible below the bar on small screens */}
            <form onSubmit={handleSearch} className="border-t border-gray-100 px-4 py-2 lg:hidden">
                <div className="relative">
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="h-10 w-full rounded-lg border border-gray-300 bg-gray-50 pl-9 pr-3 text-sm outline-none focus:border-gray-900 focus:bg-white"
                    />
                    <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
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
                <div className="border-t border-gray-100 bg-white md:hidden">
                    <nav className="space-y-0.5 px-2 py-2">
                        {MAIN_NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="block rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="my-1 border-t border-gray-100" />

                        {!authReady ? (
                            <div className="space-y-2 px-3 py-2">
                                <div className="h-9 w-full animate-pulse rounded-md bg-gray-100" />
                            </div>
                        ) : isAuthenticated ? (
                            <>
                                <div className="px-3 py-2">
                                    <p className="truncate text-sm font-medium text-gray-900">
                                        {user?.name}
                                    </p>
                                    <p className="truncate text-xs text-gray-500">{user?.email}</p>
                                </div>

                                <Link
                                    href={navConfig.profileHref}
                                    onClick={() => setMenuOpen(false)}
                                    className="block rounded-md px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    My Profile
                                </Link>

                                {navConfig.extraMenuItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMenuOpen(false)}
                                        className="block rounded-md px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        {item.label}
                                    </Link>
                                ))}

                                {navConfig.ordersHref && (
                                    <Link
                                        href={navConfig.ordersHref}
                                        onClick={() => setMenuOpen(false)}
                                        className="block rounded-md px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        {navConfig.ordersLabel}
                                    </Link>
                                )}

                                <Link
                                    href="/wishlist"
                                    onClick={() => setMenuOpen(false)}
                                    className="block rounded-md px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Wishlist
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="block w-full rounded-md px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                                >
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-2 px-3 py-2">
                                <Link
                                    href="/login"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex-1 rounded-md border border-gray-300 py-2 text-center text-sm font-medium text-gray-700"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex-1 rounded-md bg-gray-900 py-2 text-center text-sm font-medium text-white"
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