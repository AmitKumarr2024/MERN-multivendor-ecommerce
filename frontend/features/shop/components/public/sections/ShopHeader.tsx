"use client";

import Image from "next/image";
import { BadgeCheck, Clock3, MapPin } from "lucide-react";
import { FollowButton } from "@/features/follow";

import type { Shop } from "../../../types/shop.types";

interface ShopHeaderProps {
    shop: Shop;
}

export default function ShopHeader({ shop }: ShopHeaderProps) {
    return (
        <div className="overflow-hidden rounded-3xl border border-default bg-surface p-2 shadow-sm sm:p-3">
            {/* =========================================================
                BANNER
               ========================================================= */}
            <div className="relative h-48 w-full overflow-hidden rounded-2xl sm:h-64">
                {shop.banner ? (
                    <Image
                        src={shop.banner}
                        alt=""
                        fill
                        priority
                        className="object-cover"
                    />
                ) : (
                    <div className="h-full w-full bg-linear-to-br from-accent/20 via-surface-muted to-purple-500/10" />
                )}

                {/* Subtle banner overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-black/5" />

                {/* =====================================================
                    OPEN STATUS
                   ===================================================== */}
                <div className="absolute right-4 top-4 sm:right-5 sm:top-5">
                    <span
                        className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold shadow-sm backdrop-blur-sm sm:px-4 ${shop.isOpen
                            ? "bg-success-bg/95 text-success-text"
                            : "bg-surface/95 text-secondary"
                            }`}
                    >
                        <span
                            className={`h-2 w-2 shrink-0 rounded-full ${shop.isOpen
                                ? "animate-pulse bg-success-text"
                                : "bg-muted"
                                }`}
                        />

                        {shop.isOpen ? "Open now" : "Closed"}
                    </span>
                </div>
            </div>

            {/* =========================================================
                SHOP INFORMATION
               ========================================================= */}
            <div className="relative px-3 pb-4 sm:px-5 sm:pb-5">
                {/* =====================================================
                    LOGO
                   ===================================================== */}
                <div className="relative z-10 -mt-12 h-20 w-20 overflow-hidden rounded-2xl border-4 border-surface bg-surface shadow-md sm:absolute sm:left-5 sm:-top-11 sm:mt-0 sm:h-24 sm:w-24">
                    {shop.logo ? (
                        <Image
                            src={shop.logo}
                            alt={shop.shopName}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-accent to-purple-500 text-2xl font-black text-accent-foreground sm:text-3xl">
                            {shop.shopName.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                {/* =====================================================
                    CONTENT
                   ===================================================== */}
                <div className="min-w-0 pt-3 sm:pl-28 sm:pt-0">
                    {/* Shop name + verified */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h1 className="text-xl font-black tracking-tight text-primary sm:text-2xl">
                            {shop.shopName}
                        </h1>

                        {shop.isVerified && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-info-text/10 bg-info-bg px-2.5 py-1 text-[11px] font-bold text-info-text">
                                <BadgeCheck className="h-3.5 w-3.5" />
                                Verified
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {shop.description ? (
                        <p className="mt-1.5 max-w-4xl text-sm leading-6 text-secondary sm:text-base">
                            {shop.description}
                        </p>
                    ) : null}
                    <div className="mt-3"><FollowButton shopId={shop._id} /></div>

                    {/* =================================================
                        META INFORMATION
                       ================================================= */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:mt-4 sm:text-sm">
                        {shop.address?.city ? (
                            <span className="inline-flex items-center gap-1.5 text-muted">
                                <MapPin className="h-4 w-4 shrink-0" />

                                <span>
                                    {[
                                        shop.address.city,
                                        shop.address.state,
                                    ]
                                        .filter(Boolean)
                                        .join(", ")}
                                </span>
                            </span>
                        ) : null}

                        <span
                            className={`inline-flex items-center gap-1.5 font-medium ${shop.isOpen
                                ? "text-success-text"
                                : "text-muted"
                                }`}
                        >
                            <Clock3 className="h-4 w-4 shrink-0" />

                            {shop.isOpen
                                ? "Open right now"
                                : "Currently closed"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}