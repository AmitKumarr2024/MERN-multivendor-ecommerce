"use client";

import { useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateShopSlug, clearSlugCheck } from "../store/shopSlice";
import { selectShopError, selectShopMutating, selectSlugCheck } from "../store/shopSelectors";
import SlugAvailabilityField from "./Slugavailabilityfield";
import { Banner, SectionIcon } from "./Shopsettingsform";
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
        <section className="rounded-2xl border border-default bg-surface p-4 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <SectionIcon><LinkIcon /></SectionIcon>
                    <div className="min-w-0">
                        <h2 className="text-sm font-semibold text-primary sm:text-base">Shop URL</h2>
                        <p className="mt-0.5 truncate text-xs text-secondary sm:text-sm">
                            yoursite.com/shop/
                            <span className="font-medium text-primary">{shop.slug}</span>
                        </p>
                    </div>
                </div>
                {!open && (
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="shrink-0 rounded-lg border border-default px-3 py-1.5 text-xs font-medium text-primary hover:bg-surface-hover"
                    >
                        Change
                    </button>
                )}
            </div>

            {open && (
                <div className="mt-4 space-y-3 border-t border-default pt-4">
                    {error ? <Banner tone="danger">{error}</Banner> : null}

                    <SlugAvailabilityField value={slug} onChange={setSlug} currentSlug={shop.slug} />

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!canSave || mutating}
                            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
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
                            className="rounded-lg border border-strong px-4 py-2 text-sm font-medium text-primary hover:bg-surface-hover"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}

function LinkIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M8 12a3 3 0 003 3l2-2a3 3 0 00-3-3m-3 3l-2 2a3 3 0 01-3-3l2-2m5-3l2-2a3 3 0 013 3l-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}