"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Sparkles, Store, Star } from "lucide-react";
import MarketplaceHeroAnimation from "./MarketplaceHeroAnimation";

/*
 * =================================================================
 * FUTURISTIC / MODERN DIRECTION
 * =================================================================
 * - Animated gradient-mesh backdrop: three blurred color fields
 *   drifting slowly (respects prefers-reduced-motion by freezing).
 * - Glassmorphic surfaces throughout: backdrop-blur + translucent
 *   bg instead of flat cards, on the eyebrow pill, flow chips, and
 *   the two floating stat cards over the image.
 * - Gradient text on the headline's second line via bg-clip-text.
 * - CTA button gets a soft glow ring on hover instead of a flat
 *   color swap — reads as "premium/current" rather than "static".
 * - Image panel gets a glowing gradient border (a padded gradient
 *   div behind a rounded inner panel) instead of a plain box.
 * All colors still route through your existing accent/surface
 * tokens — the gradients are accent-based, not new hardcoded hues,
 * so this stays correct in both light and dark mode.
 * =================================================================
 */

export default function MarketplaceHero() {
    return (
        <section className="relative overflow-hidden border-b border-default bg-surface">
            {/* ANIMATED GRADIENT MESH */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-32 -right-20 h-[420px] w-[420px] rounded-full bg-accent/25 blur-[110px] motion-safe:animate-[drift-a_14s_ease-in-out_infinite]" />
                <div className="absolute bottom-[-15%] left-[-10%] h-[380px] w-[380px] rounded-full bg-accent/15 blur-[100px] motion-safe:animate-[drift-b_18s_ease-in-out_infinite]" />
                <div className="absolute left-1/3 top-1/4 h-[280px] w-[280px] rounded-full bg-accent/10 blur-[90px] motion-safe:animate-[drift-a_20s_ease-in-out_infinite_reverse]" />
                {/* fine grid, faint, for depth */}
                <div
                    className="absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, var(--color-border, currentColor) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border, currentColor) 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-12 lg:gap-8 lg:py-24">
                    {/* =================================================
                        LEFT — MESSAGE
                    ================================================= */}
                    <div
                        className="relative z-10 animate-[fade-up_0.6s_ease-out_forwards] opacity-0 lg:col-span-5"
                        style={{ animationDelay: "40ms" }}
                    >
                        <div className="inline-flex items-center gap-2 rounded-full border border-default/60 bg-surface/60 px-3 py-1.5 text-xs font-semibold text-secondary backdrop-blur-md">
                            <Store className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                            Local shops. Online marketplace.
                        </div>

                        <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-primary sm:text-5xl lg:text-[3.4rem]">
                            Your local shop,
                            <span className="block bg-gradient-to-r from-accent via-accent to-accent/60 bg-clip-text text-transparent">
                                now online.
                            </span>
                        </h1>

                        <p className="mt-5 max-w-md text-base leading-7 text-secondary">
                            Local shop owners showcase their products online,
                            and customers discover, order, and buy directly
                            from shops they already trust.
                        </p>

                        {/* Marketplace flow — glass chips */}
                        <div className="mt-7 flex flex-wrap items-center gap-2">
                            <FlowChip icon={<Store className="h-3.5 w-3.5" />} label="Local Shop" />
                            <ArrowRight className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                            <FlowChip icon={<ShoppingBag className="h-3.5 w-3.5" />} label="Products" />
                            <ArrowRight className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                            <FlowChip label="Customer" />
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/products"
                                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/25 transition hover:shadow-xl hover:shadow-accent/35"
                            >
                                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                                <span className="relative">Shop now</span>
                                <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 rounded-xl border border-default/60 bg-surface/60 px-6 py-3 text-sm font-semibold text-primary backdrop-blur-md transition hover:bg-surface-hover"
                            >
                                Find local shops
                            </Link>
                        </div>

                        <div className="mt-7 flex items-center gap-2 text-xs text-muted">
                            <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                            <span>Verified local sellers · Fast, nearby delivery</span>
                        </div>
                    </div>

                    {/* =================================================
                        RIGHT — IMAGE WITH GLOW BORDER + FLOATING
                        GLASS STAT CARDS
                    ================================================= */}
                    <div
                        className="relative animate-[fade-up_0.6s_ease-out_forwards] opacity-0 lg:col-span-7"
                        style={{ animationDelay: "140ms" }}
                    >
                        {/* Glow border: gradient div behind a padded inner panel */}
                        <div className="relative rounded-[2rem] bg-gradient-to-br from-accent/40 via-accent/10 to-transparent p-[1.5px]">
                            <div className="relative aspect-16/11 w-full overflow-hidden rounded-[calc(2rem-1.5px)] bg-surface sm:aspect-16/10 lg:aspect-4/3">
                                <MarketplaceHeroAnimation />
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                            </div>
                        </div>


                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-up {
                    from {
                        opacity: 0;
                        transform: translateY(14px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes drift-a {
                    0%,
                    100% {
                        transform: translate(0, 0) scale(1);
                    }
                    50% {
                        transform: translate(-30px, 25px) scale(1.08);
                    }
                }
                @keyframes drift-b {
                    0%,
                    100% {
                        transform: translate(0, 0) scale(1);
                    }
                    50% {
                        transform: translate(25px, -20px) scale(1.06);
                    }
                }
                @media (prefers-reduced-motion: reduce) {
                    .animate-\\[fade-up_0\\.6s_ease-out_forwards\\] {
                        animation: none;
                        opacity: 1;
                    }
                }
            `}</style>
        </section>
    );
}

function FlowChip({ icon, label }: { icon?: React.ReactNode; label: string }) {
    return (
        <div className="flex items-center gap-2 rounded-xl border border-default/60 bg-surface/60 px-3 py-2 backdrop-blur-md">
            {icon && <span className="text-accent">{icon}</span>}
            <span className="text-xs font-semibold text-primary">{label}</span>
        </div>
    );
}