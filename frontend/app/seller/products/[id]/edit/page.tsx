"use client";

import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProductById, clearCurrentProduct } from "@/features/products";
import { selectCurrentProduct, selectProductDetailLoading } from "@/features/products";
import { ProductForm } from "@/features/products";

interface EditProductPageProps {
    params: { id: string };
}

export default function EditProductPage({ params }: EditProductPageProps) {
    const dispatch = useAppDispatch();
    const product = useAppSelector(selectCurrentProduct);
    const loading = useAppSelector(selectProductDetailLoading);

    useEffect(() => {
        dispatch(fetchProductById(params.id));
        return () => {
            dispatch(clearCurrentProduct());
        };
    }, [dispatch, params.id]);

    if (loading || !product) {
        return (
            <div className="mx-auto max-w-2xl p-6">
                <p className="text-sm text-gray-400">Loading product...</p>
            </div>
        );
    }

    return <ProductForm product={product} />;
}