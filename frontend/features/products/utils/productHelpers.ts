import type { Product, ProductCategory, ProductShop } from "../types/product.types";

export function formatPrice(value: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
}

export function getShopInfo(product: Product): ProductShop | null {
    return typeof product.shop === "string" ? null : product.shop;
}

export function getCategoryInfo(product: Product): ProductCategory | null {
    return typeof product.category === "string" ? null : product.category;
}

/** Falls back to a plain price/discount calc if effectivePrice wasn't attached (list endpoints don't compute it). */
export function resolveEffectivePrice(product: Product): number {
    if (typeof product.effectivePrice === "number") return product.effectivePrice;
    if (product.discountPrice && product.discountPrice < product.price) {
        return product.discountPrice;
    }
    return product.price;
}

export function resolveDiscountPercent(product: Product): number {
    if (typeof product.discountPercent === "number") return product.discountPercent;
    if (product.discountPrice && product.discountPrice < product.price) {
        return Math.round(((product.price - product.discountPrice) / product.price) * 100);
    }
    return 0;
}