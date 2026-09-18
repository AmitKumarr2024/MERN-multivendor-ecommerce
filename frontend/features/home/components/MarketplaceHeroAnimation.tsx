"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import styles from "./css/MarketplaceHeroAnimation.module.css";

/**
 * Each animated frame, in animation order.
 * Keeping this as data (instead of 6 hand-duplicated JSX blocks)
 * means adding/removing/reordering a step never requires touching
 * CSS class wiring by hand, and keeps the component tree small.
 */
const FRAMES = [
    {
        key: "seller",
        className: styles.seller,
        src: "/hero/seller.png",
        alt: "Local shop seller",
        label: "Shop Seller",
        width: 900,
        height: 900,
    },
    {
        key: "customerOrder",
        className: styles.customerOrder,
        src: "/hero/custommerorder.png",
        alt: "Customer placing an order",
        label: "Customer Order",
        width: 400,
        height: 500,
    },
    {
        key: "mobile",
        className: styles.mobile,
        src: "/hero/mobile.png",
        alt: "Marketplace mobile application",
        label: "Online Order",
        width: 300,
        height: 500,
    },
    {
        key: "bag",
        className: styles.bag,
        src: "/hero/bags.png",
        alt: "Shopping bag",
        label: "Shopping Bag",
        width: 300,
        height: 300,
    },
    {
        key: "parcel",
        className: styles.parcel,
        src: "/hero/parcel box.png",
        alt: "Customer order parcel",
        label: "Parcel Delivery",
        width: 300,
        height: 300,
    },
    {
        key: "customer",
        className: styles.customer,
        src: "/hero/custommer.png",
        alt: "Customer receiving order",
        label: "Happy Customer",
        width: 400,
        height: 500,
    },
] as const;

export default function MarketplaceHeroAnimation() {
    // Respect the user's OS-level motion preference. When reduced motion
    // is requested we skip mounting the animated frames entirely instead
    // of just freezing them with CSS — this avoids decoding/painting six
    // images the user will never see move, saving bandwidth + paint time.
    const [reducedMotion, setReducedMotion] = useState(false);

    useEffect(() => {
        const query = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReducedMotion(query.matches);

        const handleChange = (event: MediaQueryListEvent) =>
            setReducedMotion(event.matches);

        query.addEventListener("change", handleChange);
        return () => query.removeEventListener("change", handleChange);
    }, []);

    return (
        <div
            className={styles.animation}
            aria-label="Local marketplace shopping process"
        >
            {/* =====================================================
                STATIC SHOP
                Always visible, never animates — highest-priority
                paint, loaded eagerly.
            ===================================================== */}
            <div className={styles.shop}>
                <Image
                    src="/hero/shop.png"
                    alt="Local shop"
                    width={1200}
                    height={1200}
                    priority
                    fetchPriority="high"
                    sizes="(min-width: 1024px) 350px, (min-width: 640px) 290px, 58vw"
                    className={styles.image}
                />
                <span className={styles.label}>Local Shop</span>
            </div>

            {/* =====================================================
                ANIMATED FRAMES
                Skipped entirely under prefers-reduced-motion so we
                never decode/paint images that won't be shown moving.
            ===================================================== */}
            {!reducedMotion &&
                FRAMES.map((frame) => (
                    <div
                        key={frame.key}
                        className={`${styles.element} ${frame.className}`}
                    >
                        <Image
                            src={frame.src}
                            alt={frame.alt}
                            width={frame.width}
                            height={frame.height}
                            loading="lazy"
                            sizes="(min-width: 1024px) 170px, (min-width: 640px) 150px, 27vw"
                            className={styles.image}
                        />
                        <span className={styles.label}>{frame.label}</span>
                    </div>
                ))}
        </div>
    );
}