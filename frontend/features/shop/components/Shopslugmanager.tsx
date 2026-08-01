"use client";

import { useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateShopSlug, clearSlugCheck } from "../store/shopSlice";
import { selectShopError, selectShopMutating, selectSlugCheck } from "../store/shopSelectors";
import SlugAvailabilityField from "./Slugavailabilityfield";
import type { Shop } from "../types/shop.types";

interface ShopSlugManagerProps {
    shop: Shop;
}

export default function ShopSlugManager({ shop }: ShopSlugManagerProps) {
    const dispatch = useAppDispatch();
    const mutating = useAppSelector(selectShopMutating);
    const error = useAppSelector(selectShopError);
    const slugCheck = useAppSelector(selectSlugCheck);

    const [slug, setSlug] = useState(shop.slug);
    const [open, setOpen] = useState(false);

    const normalized = slug.trim().toLowerCase();
    const isUnchanged = normalized === shop.slug;
    const canSave =
        !isUnchanged && normalized.length > 0 && (slugCheck?.slug !== normalized || slugCheck.available);

    const handleSave = async () => {
        const result = await dispatch(updateShopSlug({ slug: normalized }));
        if (updateShopSlug.fulfilled.match(result)) {
            setOpen(false);
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-900">Shop URL</h2>
                    <p className="mt-0.5 text-sm text-gray-500">
                        yoursite.com/shop/<span className="font-medium text-gray-700">{shop.slug}</span>
                    </p>
                </div>
                {!open && (
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Change
                    </button>
                )}
            </div>

            {open && (
                <div className="space-y-3">
                    {error ? (
                        <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">{error}</div>
                    ) : null}

                    <SlugAvailabilityField value={slug} onChange={setSlug} currentSlug={shop.slug} />

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!canSave || mutating}
                            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                            {mutating ? "Saving..." : "Save new URL"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                setSlug(shop.slug);
                                dispatch(clearSlugCheck());
                            }}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}