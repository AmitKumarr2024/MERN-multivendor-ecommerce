// features/home/utils/home.utils.ts

import type { Product } from "@/features/product/types/product.types";

/**
 * Return newest products
 */
export function getNewArrivals(
    products: Product[],
    limit = 10,
): Product[] {
    return [...products]
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        )
        .slice(0, limit);
}

/**
 * Return discounted products
 */
export function getDeals(
    products: Product[],
    limit = 10,
): Product[] {
    return products
        .filter(
            (product) =>
                product.discountPrice !== null &&
                product.discountPrice !== undefined &&
                product.discountPrice < product.price,
        )
        .slice(0, limit);
}

/**
 * Return active products
 */
export function getTrendingProducts(
    products: Product[],
    limit = 10,
): Product[] {
    return products
        .filter((product) => product.active)
        .slice(0, limit);
}

/**
 * Return best seller products
 * Replace with soldCount sorting when backend supports it.
 */
export function getBestSellers(
    products: Product[],
    limit = 10,
): Product[] {
    return products.slice(0, limit);
}

/**
 * Return flash sale products
 * Replace when backend adds flashSale support.
 */
export function getFlashSale(
    products: Product[],
    limit = 10,
): Product[] {
    return getDeals(products, limit);
}

/**
 * Return recommended products
 * Replace with personalized recommendations later.
 */
export function getRecommendedProducts(
    products: Product[],
    limit = 10,
): Product[] {
    return products.slice(0, limit);
}

/**
 * Search products
 */
export function searchProducts(
    products: Product[],
    keyword: string,
): Product[] {
    const query = keyword.trim().toLowerCase();

    if (!query) {
        return products;
    }

    return products.filter((product) =>
        product.name.toLowerCase().includes(query),
    );
}

/**
 * Calculate discount percentage
 */
export function getDiscountPercentage(
    price: number,
    discountPrice?: number | null,
): number {
    if (
        discountPrice === null ||
        discountPrice === undefined ||
        discountPrice >= price
    ) {
        return 0;
    }

    return Math.round(
        ((price - discountPrice) / price) * 100,
    );
}