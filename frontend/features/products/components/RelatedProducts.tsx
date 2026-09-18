"use client";

import { useEffect, useState } from "react";
import api from "@/services/axios";
import type { Product } from "../types/product.types";
import ProductCard from "./productCard";
import ProductCardSkeleton from "./productCardSkeleton";

export default function RelatedProducts({ productId }: { productId: string }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        api
            .get<Product[]>(`/products/${productId}/related`)
            .then(({ data }) => {
                if (!cancelled) setProducts(data);
            })
            .catch(() => { })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [productId]);

    if (!loading && products.length === 0) return null;

    return (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold text-primary">Similar products</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                    : products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
        </div>
    );
}