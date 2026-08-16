"use client";

import { use, useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProductById, clearCurrentProduct } from "@/features/products";
import { selectCurrentProduct, selectProductDetailLoading } from "@/features/products";
import { ProductForm } from "@/features/products";

interface EditProductPageProps {
    params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
    // `use()` unwraps the params Promise itself — no `async`, no `await`.
    // Client Components can never be async; `use()` is React's mechanism
    // for suspending a synchronous component until a promise resolves.
    const { id } = use(params);

    const dispatch = useAppDispatch();
    const product = useAppSelector(selectCurrentProduct);
    const loading = useAppSelector(selectProductDetailLoading);

    useEffect(() => {
        dispatch(fetchProductById(id));
        return () => {
            dispatch(clearCurrentProduct());
        };
    }, [dispatch, id]);

    if (loading || !product) {
        return (
            <div className="mx-auto max-w-2xl p-6">
                <p className="text-sm text-gray-400">Loading product...</p>
            </div>
        );
    }

    return <ProductForm product={product} />;
}