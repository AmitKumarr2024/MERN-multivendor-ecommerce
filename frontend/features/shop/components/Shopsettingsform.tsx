"use client";

import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateMyShop, toggleShopActive } from "../store/shopSlice";
import { selectShopError, selectShopMutating } from "../store/shopSelectors";
import type { Shop, UpdateShopPayload } from "../types/shop.types";
import { ImageUploadField } from "@/features/upload";

interface ShopSettingsFormProps {
    shop: Shop;
}

export default function ShopSettingsForm({ shop }: ShopSettingsFormProps) {
    const dispatch = useAppDispatch();
    const mutating = useAppSelector(selectShopMutating);
    const error = useAppSelector(selectShopError);

    const [form, setForm] = useState<UpdateShopPayload>({
        shopName: shop.shopName,
        description: shop.description ?? "",
        logo: shop.logo ?? "",
        banner: shop.banner ?? "",
        contactPhone: shop.contactPhone ?? "",
        contactEmail: shop.contactEmail ?? "",
        address: shop.address ?? {},
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setForm({
            shopName: shop.shopName,
            description: shop.description ?? "",
            logo: shop.logo ?? "",
            banner: shop.banner ?? "",
            contactPhone: shop.contactPhone ?? "",
            contactEmail: shop.contactEmail ?? "",
            address: shop.address ?? {},
        });
    }, [shop]);

    const update = <K extends keyof UpdateShopPayload>(key: K, value: UpdateShopPayload[K]) => {
        setForm((f) => ({ ...f, [key]: value }));
        setSaved(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await dispatch(updateMyShop(form));
        if (updateMyShop.fulfilled.match(result)) {
            setSaved(true);
        }
    };

    const handleToggleActive = () => {
        dispatch(toggleShopActive());
    };

    return (
        <section className="overflow-hidden rounded-2xl border border-default bg-surface shadow-sm">
            <div className="flex items-start justify-between gap-3 border-b border-default px-4 py-4 sm:px-6">
                <div className="flex items-start gap-3">
                    <SectionIcon><StoreIcon /></SectionIcon>
                    <div>
                        <h2 className="text-sm font-semibold text-primary sm:text-base">Shop details</h2>
                        <p className="mt-0.5 text-xs text-secondary sm:text-sm">
                            Visible to buyers on your public shop page.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleToggleActive}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${shop.isActive
                        ? "bg-success-bg text-success-text hover:opacity-80"
                        : "bg-surface-muted text-secondary hover:bg-surface-hover"
                        }`}
                >
                    {shop.isActive ? "● Live" : "○ Hidden"}
                </button>
            </div>

            <div className="p-4 sm:p-6">
                {error ? <Banner tone="danger">{error}</Banner> : null}
                {saved ? <Banner tone="success">Saved successfully.</Banner> : null}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Field label="Shop name">
                        <input
                            type="text"
                            value={form.shopName}
                            onChange={(e) => update("shopName", e.target.value)}
                            required
                            className={inputClass}
                        />
                    </Field>

                    <ImageUploadField
                        label="Shop logo"
                        value={form.logo}
                        onChange={(url) => update("logo", url)}
                        folder="shop-logo"
                        shape="square"
                    />
                    <ImageUploadField
                        label="Shop banner"
                        value={form.banner}
                        onChange={(url) => update("banner", url)}
                        folder="shop-banner"
                        shape="wide"
                    />

                    <Field label="Description">
                        <textarea
                            value={form.description}
                            onChange={(e) => update("description", e.target.value)}
                            rows={3}
                            placeholder="Tell buyers what makes your shop special..."
                            className={`${inputClass} resize-none`}
                        />
                    </Field>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Contact phone">
                            <input
                                type="tel"
                                value={form.contactPhone}
                                onChange={(e) => update("contactPhone", e.target.value)}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Contact email">
                            <input
                                type="email"
                                value={form.contactEmail}
                                onChange={(e) => update("contactEmail", e.target.value)}
                                className={inputClass}
                            />
                        </Field>
                    </div>

                    <button
                        type="submit"
                        disabled={mutating}
                        className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
                    >
                        {mutating ? "Saving..." : "Save changes"}
                    </button>
                </form>
            </div>
        </section>
    );
}

/* ---------- shared bits, reused across the shop-settings group ---------- */

export const inputClass =
    "w-full rounded-lg border border-strong bg-surface px-3 py-2.5 text-sm text-primary shadow-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent placeholder:text-muted";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-primary">{label}</label>
            {children}
        </div>
    );
}

export function Banner({ tone, children }: { tone: "danger" | "success"; children: React.ReactNode }) {
    const cls = tone === "danger" ? "bg-danger-bg text-danger-text" : "bg-success-bg text-success-text";
    return <div className={`mb-4 rounded-lg px-3 py-2.5 text-sm ${cls}`}>{children}</div>;
}

export function SectionIcon({ children }: { children: React.ReactNode }) {
    return (
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-secondary">
            {children}
        </span>
    );
}

function StoreIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M3 8l1-4h12l1 4M3 8v7a1 1 0 001 1h3v-5h6v5h3a1 1 0 001-1V8M3 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}