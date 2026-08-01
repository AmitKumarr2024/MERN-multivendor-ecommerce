import { ProductDetail } from "@/features/products";

interface ProductPageProps {
    params: { id: string };
}

export default function ProductPage({ params }: ProductPageProps) {
    return <ProductDetail productId={params.id} />;
}