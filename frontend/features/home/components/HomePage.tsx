"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Store,
    Tag,
    ShieldCheck,
    Truck,
    RotateCcw,
    Headset,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
    fetchAllProducts,
    ProductGrid,
    selectProductItems,
    selectProductListLoading,
} from "@/features/products";

import {
    fetchCategories,
    selectCategories,
    selectCategoryLoading,
} from "@/features/category";

import {
    fetchAllShops,
    selectShops,
    selectDirectoryLoading,
} from "@/features/shop";

import ShopCard from "@/features/shop/components/directory/Shopcard";
import MarketplaceHero from "./MarketplaceHero";

/*
 * =================================================================
 * DESIGN: classic e-commerce, per reference screenshots
 * =================================================================
 * Devices pulled from the references and where they landed here:
 *  - Trust strip (4 icons under hero)        -> TrustStrip
 *  - Circular category icons, not chips      -> category section
 *  - Two-up colored promo tiles              -> PromoTiles
 *  - Big tinted "collection" callout panel   -> CollectionCallout
 *    (replaces the old plain spotlight card)
 *  - Wrapped grids via ProductGrid/ShopCard, not horizontal lanes
 * =================================================================
 */

const CONTAINER = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

export default function HomePage() {
    const dispatch = useAppDispatch();

    const products = useAppSelector(selectProductItems);
    const productsLoading = useAppSelector(selectProductListLoading);

    const categories = useAppSelector(selectCategories);
    const categoriesLoading = useAppSelector(selectCategoryLoading);

    const shops = useAppSelector(selectShops);
    const shopsLoading = useAppSelector(selectDirectoryLoading);

    useEffect(() => {
        void dispatch(fetchAllProducts({ sort: "newest", page: 1, limit: 50 }));
        void dispatch(fetchCategories());
        void dispatch(fetchAllShops({ page: 1, limit: 8 }));
    }, [dispatch]);

    const featuredProduct = useMemo(() => {
        return (
            products.find(
                (product) =>
                    product.isActive &&
                    product.discountPrice != null &&
                    product.discountPrice < product.price,
            ) ??
            products.find((product) => product.isActive) ??
            null
        );
    }, [products]);

    const rootCategories = useMemo(
        () =>
            categories
                .filter((category) => category.isActive && !category.parent)
                .slice(0, 8),
        [categories],
    );

    const dealProducts = useMemo(
        () =>
            products
                .filter(
                    (product) =>
                        product.isActive &&
                        product.discountPrice != null &&
                        product.discountPrice < product.price,
                )
                .sort(
                    (a, b) =>
                        Number(b.discountPercent ?? 0) - Number(a.discountPercent ?? 0),
                )
                .slice(0, 8),
        [products],
    );

    const latestProducts = useMemo(
        () =>
            [...products]
                .filter((product) => product.isActive)
                .sort((a, b) => {
                    const aDate = new Date(a.createdAt ?? 0).getTime();
                    const bDate = new Date(b.createdAt ?? 0).getTime();
                    return bDate - aDate;
                })
                .slice(0, 8),
        [products],
    );

    const categorySections = useMemo(() => {
        return rootCategories
            .map((category) => {
                const categoryProducts = products
                    .filter((product) => {
                        if (!product.isActive) {
                            return false;
                        }

                        const productCategory = product.category;

                        if (!productCategory) {
                            return false;
                        }

                        if (typeof productCategory === "string") {
                            return (
                                productCategory === category._id ||
                                productCategory === category.slug
                            );
                        }

                        return (
                            productCategory._id === category._id ||
                            productCategory.slug === category.slug
                        );
                    })
                    .sort((a, b) => {
                        const aDate = new Date(
                            a.createdAt ?? 0,
                        ).getTime();

                        const bDate = new Date(
                            b.createdAt ?? 0,
                        ).getTime();

                        return bDate - aDate;
                    })
                    .slice(0, 4);

                return {
                    category,
                    products: categoryProducts,
                };
            })
            .filter(
                (section) => section.products.length > 0,
            )
            .slice(0, 5);
    }, [products, rootCategories]);

    const featuredShops = useMemo(() => shops.slice(0, 4), [shops]);

    const featuredDiscount =
        featuredProduct?.discountPercent != null
            ? Math.round(Number(featuredProduct.discountPercent))
            : null;

    return (
        <main className="min-h-screen">
            {/* =================================================
                HERO
            ================================================= */}

            <MarketplaceHero />

            {/* =================================================
                TRUST STRIP — image 1's "Responsive / Secure /
                Shipping / Transparent" row, reworded for a local
                marketplace.
            ================================================= */}

            <section className="border-b border-default bg-surface">
                <div className={`${CONTAINER} grid grid-cols-2 gap-4 py-5 sm:grid-cols-4 sm:gap-6 sm:py-6`}>
                    <TrustItem
                        icon={<ShieldCheck className="h-5 w-5" />}
                        title="Verified sellers"
                        subtitle="Checked local shops"
                    />
                    <TrustItem
                        icon={<Truck className="h-5 w-5" />}
                        title="Fast delivery"
                        subtitle="From nearby shops"
                    />
                    <TrustItem
                        icon={<RotateCcw className="h-5 w-5" />}
                        title="Easy returns"
                        subtitle="Hassle-free policy"
                    />
                    <TrustItem
                        icon={<Headset className="h-5 w-5" />}
                        title="24/7 support"
                        subtitle="We're here to help"
                    />
                </div>
            </section>

            {/* =================================================
                CATEGORIES — circular icons, image 2's "Popular
                Categories" pattern.
            ================================================= */}

            {rootCategories.length > 0 && (
                <section className={`${CONTAINER} py-8 sm:py-10`}>
                    <SectionHeading title="Popular categories" href="/categories" />

                    <div className="flex gap-5 overflow-x-auto pb-2 sm:gap-8 [scrollbar-width:thin]">
                        {rootCategories.map((category) => (
                            <Link
                                key={category._id}
                                href={`/categories/${category.slug}`}
                                className="flex shrink-0 flex-col items-center gap-2 text-center"
                            >
                                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-default bg-surface-muted transition group-hover:border-accent sm:h-20 sm:w-20">
                                    <Tag className="h-6 w-6 text-accent" />
                                </span>
                                <span className="max-w-20 truncate text-xs font-medium text-secondary">
                                    {category.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* =================================================
                PROMO TILES — two-up colored banners, images 1/3/4.
                Marketplace-relevant instead of generic "sale"
                copy: one drives sellers to list, one reassures
                buyers on delivery.
            ================================================= */}

            <section className={`${CONTAINER} grid gap-4 pb-8 sm:grid-cols-2 sm:pb-10`}>
                <PromoTile
                    eyebrow="For shop owners"
                    title="Sell on Amitora Market"
                    body="List your shop online in minutes and reach buyers nearby."
                    cta="Start selling"
                    href="/seller/shop"
                    tone="accent"
                />
                <PromoTile
                    eyebrow="For buyers"
                    title="Same-city delivery"
                    body="Order from shops close to you and get it fast."
                    cta="Explore shops"
                    href="/shop"
                    tone="muted"
                />
            </section>

            {/* =================================================
                DEALS
            ================================================= */}

            {dealProducts.length > 0 && (
                <section className={`${CONTAINER} py-8 sm:py-10`}>
                    <SectionHeading
                        title="Best deals right now"
                        subtitle="Steepest discounts across every shop"
                        href="/products"
                        badge="Limited time"
                    />
                    <ProductGrid products={dealProducts} loading={productsLoading} />
                </section>
            )}

            {/* =================================================
                COLLECTION CALLOUT — image 4's tinted "Discover Our
                New Collection" panel, adapted as the featured-
                product spotlight instead of a plain bordered card.
            ================================================= */}

            {featuredProduct && (
                <section className={`${CONTAINER} py-8 sm:py-10`}>
                    <div className="overflow-hidden rounded-2xl bg-accent/10">
                        <div className="grid items-center gap-6 p-6 sm:p-10 lg:grid-cols-2 lg:gap-10">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-accent">
                                    Spotlight pick
                                </span>
                                <h2 className="mt-3 text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                                    {featuredProduct.name}
                                </h2>
                                <p className="mt-3 max-w-md text-sm leading-relaxed text-secondary">
                                    {featuredProduct.description ||
                                        "Discover this product from our marketplace."}
                                </p>
                                <div className="mt-6 flex flex-wrap items-center gap-4">
                                    <Link
                                        href={`/products/${featuredProduct._id}`}
                                        className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:opacity-90"
                                    >
                                        Shop now
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    {featuredDiscount != null && (
                                        <span className="text-sm font-bold text-accent">
                                            {featuredDiscount}% off
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex min-h-52 items-center justify-center rounded-xl bg-surface p-6">
                                {featuredProduct.images?.[0] ? (
                                    <img
                                        src={featuredProduct.images[0]}
                                        alt={featuredProduct.name}
                                        loading="lazy"
                                        decoding="async"
                                        className="max-h-64 w-full object-contain"
                                    />
                                ) : (
                                    <Store className="h-16 w-16 text-muted" />
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* =================================================
                FEATURED SHOPS
            ================================================= */}

            <section className={`${CONTAINER} py-8 sm:py-10`}>
                <SectionHeading
                    title="Featured shops"
                    subtitle="Sellers actively stocking the marketplace"
                    href="/shop"
                />

                {shopsLoading ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-72 animate-pulse rounded-lg border border-default bg-surface-muted"
                            />
                        ))}
                    </div>
                ) : featuredShops.length === 0 ? (
                    <EmptyState
                        icon={<Store className="mx-auto h-9 w-9 text-muted" />}
                        message="No shops are open yet — check back soon."
                    />
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {featuredShops.map((shop) => (
                            <ShopCard key={shop._id} shop={shop} />
                        ))}
                    </div>
                )}
            </section>

            {/* =================================================
                NEW ARRIVALS
            ================================================= */}

            {latestProducts.length > 0 && (
                <section className={`${CONTAINER} py-8 sm:py-10`}>
                    <SectionHeading
                        title="New arrivals"
                        subtitle="Freshly listed by sellers this week"
                        href="/products"
                    />
                    <ProductGrid products={latestProducts} loading={productsLoading} />
                </section>
            )}


            {/* =================================================
    CATEGORY-WISE PRODUCTS
================================================= */}

            {categorySections.map(
                ({ category, products: categoryProducts }) => (
                    <section
                        key={category._id}
                        className={`${CONTAINER} py-8 sm:py-10`}
                    >
                        <SectionHeading
                            title={category.name}
                            subtitle={`Latest products in ${category.name}`}
                            href={`/categories/${category.slug}`}
                        />

                        <ProductGrid
                            products={categoryProducts}
                            loading={productsLoading}
                        />
                    </section>
                ),
            )}
        </main>
    );
}

/*
 * =================================================================
 * SMALL PRESENTATIONAL HELPERS
 * =================================================================
 */

function TrustItem({
    icon,
    title,
    subtitle,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                {icon}
            </span>
            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-primary">{title}</p>
                <p className="truncate text-xs text-secondary">{subtitle}</p>
            </div>
        </div>
    );
}

function PromoTile({
    eyebrow,
    title,
    body,
    cta,
    href,
    tone,
}: {
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
    href: string;
    tone: "accent" | "muted";
}) {
    return (
        <div
            className={`flex flex-col justify-center rounded-2xl p-6 sm:p-8 ${tone === "accent" ? "bg-accent text-accent-foreground" : "bg-surface-muted"
                }`}
        >
            <span
                className={`text-xs font-bold uppercase tracking-wide ${tone === "accent" ? "text-accent-foreground/80" : "text-secondary"
                    }`}
            >
                {eyebrow}
            </span>
            <h3
                className={`mt-2 text-xl font-bold tracking-tight sm:text-2xl ${tone === "accent" ? "text-accent-foreground" : "text-primary"
                    }`}
            >
                {title}
            </h3>
            <p
                className={`mt-2 max-w-sm text-sm ${tone === "accent" ? "text-accent-foreground/80" : "text-secondary"
                    }`}
            >
                {body}
            </p>
            <Link
                href={href}
                className={`mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition ${tone === "accent"
                    ? "bg-surface text-primary hover:opacity-90"
                    : "bg-accent text-accent-foreground hover:opacity-90"
                    }`}
            >
                {cta}
                <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    );
}

function SectionHeading({
    title,
    subtitle,
    href,
    badge,
}: {
    title: string;
    subtitle?: string;
    href: string;
    badge?: string;
}) {
    return (
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
            <div>
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-primary sm:text-2xl">
                        {title}
                    </h2>
                    {badge && (
                        <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-500">
                            {badge}
                        </span>
                    )}
                </div>
                {subtitle && <p className="mt-1 text-sm text-secondary">{subtitle}</p>}
            </div>

            <Link
                href={href}
                className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-accent transition hover:gap-1.5"
            >
                View all
                <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    );
}

function EmptyState({
    icon,
    message,
}: {
    icon: React.ReactNode;
    message: string;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-default bg-surface py-16 text-center">
            {icon}
            <p className="mt-3 text-sm text-secondary">{message}</p>
        </div>
    );
}