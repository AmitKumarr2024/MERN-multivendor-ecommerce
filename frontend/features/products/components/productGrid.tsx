import type { Product } from "../types/product.types";
import ProductCard from "./productCard";
import ProductCardSkeleton from "./productCardSkeleton";

interface ProductGridProps {
    products: Product[];
    loading?: boolean;
    emptyMessage?: string;
}

export default function ProductGrid({
    products,
    loading = false,
    emptyMessage = "No products found.",
}: ProductGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
                <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="mb-3 h-10 w-10 text-gray-300"
                >
                    <path d="M3 4h14l1 4H2l1-4Zm-1 5h16v7a1 1 0 0 1-1 1h-4v-5H7v5H3a1 1 0 0 1-1-1V9Z" />
                </svg>
                <p className="text-sm text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
                <ProductCard key={product._id} product={product} />
            ))}
        </div>
    );
}