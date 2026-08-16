import type { Metadata } from "next";

import { PublicShopPage } from "@/features/shop";

interface ShopPageProps {
    params: Promise<{
        slug: string;
    }>;
}

interface ShopMetadata {
    shopName: string;
    description?: string;
}

async function getShopBySlug(slug: string): Promise<ShopMetadata | null> {
    const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3008/api";

    try {
        const response = await fetch(
            `${apiUrl}/shops/${encodeURIComponent(slug)}`,
            {
                next: {
                    revalidate: 60,
                },
            }
        );

        if (!response.ok) {
            return null;
        }

        return response.json();
    } catch (error) {
        console.error("Failed to fetch shop metadata:", error);
        return null;
    }
}

export async function generateMetadata({
    params,
}: ShopPageProps): Promise<Metadata> {
    const { slug } = await params;

    const shop = await getShopBySlug(slug);

    if (!shop) {
        return {
            title: "Shop Not Found | Amitora Market",
        };
    }

    return {
        title: shop.shopName,
        description:
            shop.description ||
            `Shop products from ${shop.shopName} on Amitora Market.`,
    };
}

export default async function ShopBySlugPage({
    params,
}: ShopPageProps) {
    const { slug } = await params;

    return <PublicShopPage slug={slug} />;
}