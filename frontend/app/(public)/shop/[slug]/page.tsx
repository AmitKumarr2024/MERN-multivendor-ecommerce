import { PublicShopPage } from "@/features/shop";

interface ShopPageProps {
    params: { slug: string };
}

export default function ShopBySlugPage({ params }: ShopPageProps) {
    return <PublicShopPage slug={params.slug} />;
}