"use client";

import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyShop } from "../store/shopSlice";
import { selectHasCheckedMyShop, selectMyShop, selectMyShopLoading } from "../store/shopSelectors";

import CreateShopForm from "./Createshopform";
import ShopSettingsForm from "./Shopsettingsform";
import ShopSlugManager from "./Shopslugmanager";
import BusinessHoursEditor from "./Businesshourseditor";
import HolidayManager from "./Holidaymanager";
import { SellerBroadcastForm } from "@/features/messaging";

const NAV_ITEMS = [
    { key: "details", label: "Shop details", desc: "Name, description, contact", icon: StoreIcon },
    { key: "hours", label: "Hours & holidays", desc: "Business hours, closures", icon: ClockIcon },
    { key: "announcements", label: "Announcements", desc: "Live shop broadcasts", icon: MegaphoneIcon },
] as const;

type NavKey = (typeof NAV_ITEMS)[number]["key"];

export default function ShopDashboard() {
    const dispatch = useAppDispatch();

    const shop = useAppSelector(selectMyShop);
    const loading = useAppSelector(selectMyShopLoading);
    const hasChecked = useAppSelector(selectHasCheckedMyShop);

    const [active, setActive] = useState<NavKey>("details");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchMyShop());
    }, [dispatch]);

    if (loading && !hasChecked) {
        return (
            <div className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6">
                <div className="h-20 animate-pulse rounded-2xl border border-default bg-surface-muted" />
                <div className="h-64 animate-pulse rounded-2xl border border-default bg-surface-muted" />
            </div>
        );
    }

    if (hasChecked && !shop) {
        return <CreateShopForm />;
    }

    if (!shop) return null;

    const activeItem = NAV_ITEMS.find((i) => i.key === active)!;

    const selectTab = (key: NavKey) => {
        setActive(key);
        setSidebarOpen(false);
    };

    return (
        <div className="mx-auto max-w-7xl p-4 pb-10 sm:p-6">
            {/* Header */}
            <div className="mb-4 flex items-center gap-3 sm:mb-6">
                {/* Mobile: hamburger to open the sidebar */}
                <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-default bg-surface text-secondary hover:bg-surface-hover lg:hidden"
                    aria-label="Open menu"
                >
                    <MenuIcon />
                </button>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-foreground sm:h-12 sm:w-12 sm:text-lg">
                    {shop.shopName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                    <h1 className="truncate text-base font-semibold text-primary sm:text-xl">
                        {shop.shopName}
                    </h1>
                    <p className="hidden text-sm text-secondary sm:block">Manage your dukan&apos;s public info.</p>
                </div>
                <span
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${shop.isActive ? "bg-success-bg text-success-text" : "bg-surface-muted text-secondary"
                        }`}
                >
                    <span className={`h-1.5 w-1.5 rounded-full ${shop.isActive ? "bg-success-text" : "bg-muted"}`} />
                    <span className="hidden sm:inline">{shop.isActive ? "Live" : "Hidden"}</span>
                </span>
            </div>

            <div className="flex gap-6">
                {/* Desktop sidebar — always visible, persistent column */}
                <aside className="hidden w-56 shrink-0 lg:block">
                    <SidebarNav items={NAV_ITEMS} active={active} onSelect={selectTab} />
                </aside>

                {/* Mobile sidebar — slide-out drawer */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setSidebarOpen(false)}
                            aria-hidden="true"
                        />
                        <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto border-r border-default bg-surface p-4 shadow-xl">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="text-sm font-semibold text-primary">Shop menu</span>
                                <button
                                    type="button"
                                    onClick={() => setSidebarOpen(false)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary hover:bg-surface-hover"
                                    aria-label="Close menu"
                                >
                                    <CloseIcon />
                                </button>
                            </div>
                            <SidebarNav items={NAV_ITEMS} active={active} onSelect={selectTab} />
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <h2 className="mb-3 text-sm font-semibold text-secondary lg:hidden">
                        {activeItem.label}
                    </h2>

                    <div className="space-y-4 sm:space-y-5">
                        {active === "details" && (
                            <>
                                <ShopSettingsForm shop={shop} />
                                <ShopSlugManager shop={shop} />
                            </>
                        )}
                        {active === "hours" && (
                            <>
                                <BusinessHoursEditor shop={shop} />
                                <HolidayManager shop={shop} />
                            </>
                        )}
                        {active === "announcements" && <SellerBroadcastForm />}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------- sidebar nav list, shared by desktop column + mobile drawer ---------- */

function SidebarNav({
    items,
    active,
    onSelect,
}: {
    items: typeof NAV_ITEMS;
    active: NavKey;
    onSelect: (key: NavKey) => void;
}) {
    return (
        <nav className="space-y-1">
            {items.map(({ key, label, desc, icon: Icon }) => {
                const isActive = active === key;
                return (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onSelect(key)}
                        className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors ${isActive
                                ? "bg-accent text-accent-foreground"
                                : "text-secondary hover:bg-surface-hover hover:text-primary"
                            }`}
                    >
                        <span className="mt-0.5 shrink-0">
                            <Icon />
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">{label}</span>
                            <span
                                className={`block truncate text-xs ${isActive ? "text-accent-foreground/70" : "text-muted"
                                    }`}
                            >
                                {desc}
                            </span>
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}

/* ---------- icons ---------- */

function StoreIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M3 8l1-4h12l1 4M3 8v7a1 1 0 001 1h3v-5h6v5h3a1 1 0 001-1V8M3 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function MegaphoneIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M3 8v4l4 1v3a1 1 0 001 1h1v-4l8 2V6L9 8H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
    );
}

function MenuIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}