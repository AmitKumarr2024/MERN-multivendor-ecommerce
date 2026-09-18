"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import Image from "next/image";

import { MapPin, Users, ArrowRight, Store, BadgeCheck } from "lucide-react";

import { useAppDispatch } from "@/store/hooks";

import { fetchPublicStaffRoster } from "@/features/staff/store/staffSlice";

import type { Staff } from "@/features/staff/types/staff.types";
import type { ShopListItem } from "../../types/shop.types";

interface ShopCardProps {
    shop: ShopListItem;
}

/*
 * =================================================================
 * FIX: logo was a child of the h-24 `overflow-hidden` banner div,
 * so pushing it down with -bottom-4 clipped it against that same
 * div's own edge — that's the "half cut" bug. The logo is now a
 * sibling of the clipped image box, inside an outer wrapper that
 * has no overflow clipping, so it renders fully.
 *
 * Also made bolder per request: bigger (h-12/14), a real ring
 * instead of a thin border, shadow-md, rounded-xl instead of -md,
 * and z-20 so it always sits above the banner artwork.
 * =================================================================
 */

export default function ShopCard({ shop }: ShopCardProps) {
    const dispatch = useAppDispatch();

    const [staff, setStaff] = useState<Staff[]>([]);
    const [staffLoading, setStaffLoading] = useState(false);

    useEffect(() => {
        if (!shop._id) {
            setStaff([]);
            return;
        }

        let cancelled = false;

        async function loadStaff() {
            setStaffLoading(true);

            try {
                const result = await dispatch(
                    fetchPublicStaffRoster(shop._id),
                ).unwrap();

                if (cancelled) {
                    return;
                }

                const publicStaff = Array.isArray(result) ? result : [];
                const activeStaff = publicStaff.filter(
                    (member) => member.isActive !== false,
                );

                setStaff(activeStaff);
            } catch (error) {
                if (!cancelled) {
                    console.error(
                        `Failed to load public staff for shop ${shop._id}`,
                        error,
                    );
                    setStaff([]);
                }
            } finally {
                if (!cancelled) {
                    setStaffLoading(false);
                }
            }
        }

        void loadStaff();

        return () => {
            cancelled = true;
        };
    }, [dispatch, shop._id]);

    const staffCount = staff.length;

    const ownerName =
        typeof shop.owner === "object" && shop.owner !== null && "name" in shop.owner
            ? shop.owner.name
            : "—";

    const addressParts = [
        shop.address?.street,
        shop.address?.city,
        shop.address?.state,
        shop.address?.pincode,
        shop.address?.country,
    ].filter(
        (value): value is string =>
            typeof value === "string" && value.trim().length > 0,
    );

    const address = addressParts.join(", ");

    return (
        <Link
            href={`/shop/${shop.slug}`}
            className="
                group
                mx-auto
                flex
                h-full
                w-full
                max-w-[260px]
                min-w-0
                flex-col
                overflow-hidden
                rounded-lg
                border
                border-default
                bg-surface
                transition-shadow
                duration-200
                hover:shadow-md
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-accent/40
            "
        >
            {/* ==================================================
                MEDIA WRAPPER — no overflow clipping here, so the
                logo below can safely overlap the banner's bottom
                edge without being cut off.
            ================================================== */}

            <div className="relative">
                {/* Banner image — clipping lives ONLY on this inner
                    box now, not on anything the logo also sits in. */}
                <div className="relative h-24 overflow-hidden bg-surface-muted sm:h-28">
                    {shop.banner ? (
                        <Image
                            src={shop.banner}
                            alt={`${shop.shopName} banner`}
                            fill
                            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 220px"
                            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                            loading="lazy"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <Store className="h-8 w-8 text-muted" />
                        </div>
                    )}

                    <span
                        className={[
                            "absolute right-1.5 top-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold",
                            shop.isOpen
                                ? "bg-success-bg text-success-text"
                                : "bg-danger-bg text-danger-text",
                        ].join(" ")}
                    >
                        {shop.isOpen ? "Open" : "Closed"}
                    </span>
                </div>

                {/* LOGO — sibling of the clipped banner box, sits in
                    the unclipped wrapper above, so it's never cut. */}
                <div className="absolute -bottom-5 left-3 z-20 h-12 w-12 overflow-hidden rounded-xl bg-surface shadow-md ring-2 ring-surface sm:h-14 sm:w-14">
                    {shop.logo ? (
                        <Image
                            src={shop.logo}
                            alt={shop.shopName}
                            fill
                            sizes="56px"
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-accent text-lg font-bold text-accent-foreground">
                            {shop.shopName?.charAt(0).toUpperCase() || "S"}
                        </div>
                    )}
                </div>
            </div>

            {/* ==================================================
                CONTENT — extra top padding to clear the bigger,
                now-fully-visible logo
            ================================================== */}

            <div className="flex flex-1 flex-col p-2.5 pt-7 sm:pt-8">
                <div className="flex min-w-0 items-center gap-1">
                    <h3 className="min-w-0 flex-1 truncate text-xs font-semibold text-primary sm:text-[13px]">
                        {shop.shopName}
                    </h3>
                    {shop.isVerified && (
                        <BadgeCheck
                            className="h-3.5 w-3.5 shrink-0 text-accent"
                            aria-label="Verified"
                        />
                    )}
                </div>

                <p className="mt-0.5 truncate text-[10px] text-secondary">
                    {ownerName}
                </p>

                <div className="mt-1.5 flex min-w-0 items-center gap-1 text-[10px] text-secondary">
                    <Users className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                        {staffLoading ? "Loading…" : `${staffCount} staff`}
                    </span>
                </div>

                <div className="mt-1 flex items-start gap-1 text-[10px]">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-secondary" />
                    {address ? (
                        <span className="line-clamp-1 min-w-0 text-secondary">
                            {address}
                        </span>
                    ) : (
                        <span className="text-muted">No address</span>
                    )}
                </div>

                <div className="mt-auto flex items-center justify-end pt-2.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent transition-transform group-hover:translate-x-0.5">
                        Visit shop
                        <ArrowRight className="h-3 w-3" />
                    </span>
                </div>
            </div>
        </Link>
    );
}