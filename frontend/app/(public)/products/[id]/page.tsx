import { ProductDetail } from "@/features/products";

interface ProductPageProps {
    params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;

    return <ProductDetail productId={id} />;
}