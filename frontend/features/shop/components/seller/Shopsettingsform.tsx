"use client";

import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
    updateMyShop,
    toggleShopActive,
} from "../../store/shopSlice";

import {
    selectShopError,
    selectShopMutating,
} from "../../store/shopSelectors";

import type {
    Shop,
    ShopAddress,
    UpdateShopPayload,
} from "../../types/shop.types";

import { ImageUploadField } from "@/features/upload";

interface ShopSettingsFormProps {
    shop: Shop;
}

export default function ShopSettingsForm({
    shop,
}: ShopSettingsFormProps) {
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

        setSaved(false);
    }, [shop]);

    const update = <
        K extends keyof UpdateShopPayload
    >(
        key: K,
        value: UpdateShopPayload[K],
    ) => {
        setForm((current) => ({
            ...current,
            [key]: value,
        }));

        setSaved(false);
    };

    const updateAddress = <
        K extends keyof ShopAddress
    >(
        key: K,
        value: ShopAddress[K],
    ) => {
        setForm((current) => ({
            ...current,
            address: {
                ...(current.address ?? {}),
                [key]: value,
            },
        }));

        setSaved(false);
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();

        const result = await dispatch(
            updateMyShop(form),
        );

        if (updateMyShop.fulfilled.match(result)) {
            setSaved(true);
        }
    };

    const handleToggleActive = () => {
        void dispatch(toggleShopActive());
    };

    const address = form.address ?? {};

    return (
        <section className="overflow-hidden rounded-2xl border border-default bg-surface shadow-sm">
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex items-start justify-between gap-3 border-b border-default px-4 py-4 sm:px-6">
                <div className="flex items-start gap-3">
                    <SectionIcon>
                        <StoreIcon />
                    </SectionIcon>

                    <div>
                        <h2 className="text-sm font-semibold text-primary sm:text-base">
                            Shop details
                        </h2>

                        <p className="mt-0.5 text-xs text-secondary sm:text-sm">
                            Visible to buyers on your public shop page.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleToggleActive}
                    disabled={mutating}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${shop.isActive
                            ? "bg-success-bg text-success-text hover:opacity-80"
                            : "bg-surface-muted text-secondary hover:bg-surface-hover"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                    {shop.isActive
                        ? "● Live"
                        : "○ Hidden"}
                </button>
            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <div className="p-4 sm:p-6">
                {error ? (
                    <Banner tone="danger">
                        {error}
                    </Banner>
                ) : null}

                {saved ? (
                    <Banner tone="success">
                        Saved successfully.
                    </Banner>
                ) : null}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    {/* =================================================
                        SHOP NAME
                    ================================================= */}

                    <Field label="Shop name">
                        <input
                            type="text"
                            value={form.shopName ?? ""}
                            onChange={(e) =>
                                update(
                                    "shopName",
                                    e.target.value,
                                )
                            }
                            required
                            className={inputClass}
                        />
                    </Field>

                    {/* =================================================
                        LOGO
                    ================================================= */}

                    <ImageUploadField
                        label="Shop logo"
                        value={form.logo ?? ""}
                        onChange={(url) =>
                            update("logo", url)
                        }
                        folder="shop-logo"
                        shape="square"
                    />

                    {/* =================================================
                        BANNER
                    ================================================= */}

                    <ImageUploadField
                        label="Shop banner"
                        value={form.banner ?? ""}
                        onChange={(url) =>
                            update("banner", url)
                        }
                        folder="shop-banner"
                        shape="wide"
                    />

                    {/* =================================================
                        DESCRIPTION
                    ================================================= */}

                    <Field label="Description">
                        <textarea
                            value={form.description ?? ""}
                            onChange={(e) =>
                                update(
                                    "description",
                                    e.target.value,
                                )
                            }
                            rows={3}
                            placeholder="Tell buyers what makes your shop special..."
                            className={`${inputClass} resize-none`}
                        />
                    </Field>

                    {/* =================================================
                        CONTACT
                    ================================================= */}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Contact phone">
                            <input
                                type="tel"
                                value={
                                    form.contactPhone ?? ""
                                }
                                onChange={(e) =>
                                    update(
                                        "contactPhone",
                                        e.target.value,
                                    )
                                }
                                className={inputClass}
                            />
                        </Field>

                        <Field label="Contact email">
                            <input
                                type="email"
                                value={
                                    form.contactEmail ?? ""
                                }
                                onChange={(e) =>
                                    update(
                                        "contactEmail",
                                        e.target.value,
                                    )
                                }
                                className={inputClass}
                            />
                        </Field>
                    </div>

                    {/* =================================================
                        SHOP ADDRESS
                    ================================================= */}

                    <div className="rounded-xl border border-default bg-surface-muted p-4 sm:p-5">
                        <div className="mb-4 flex items-start gap-3">
                            <SectionIcon>
                                <MapPinIcon />
                            </SectionIcon>

                            <div>
                                <h3 className="text-sm font-semibold text-primary">
                                    Shop address
                                </h3>

                                <p className="mt-0.5 text-xs text-secondary">
                                    Add your shop location so buyers
                                    can find you easily.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Street */}

                            <Field label="Street address">
                                <input
                                    type="text"
                                    value={
                                        address.street ?? ""
                                    }
                                    onChange={(e) =>
                                        updateAddress(
                                            "street",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Shop no., street, area"
                                    className={inputClass}
                                />
                            </Field>

                            {/* City + State */}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field label="City">
                                    <input
                                        type="text"
                                        value={
                                            address.city ?? ""
                                        }
                                        onChange={(e) =>
                                            updateAddress(
                                                "city",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="City"
                                        className={inputClass}
                                    />
                                </Field>

                                <Field label="State">
                                    <input
                                        type="text"
                                        value={
                                            address.state ?? ""
                                        }
                                        onChange={(e) =>
                                            updateAddress(
                                                "state",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="State"
                                        className={inputClass}
                                    />
                                </Field>
                            </div>

                            {/* Pincode + Country */}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field label="Pincode">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={
                                            address.pincode ?? ""
                                        }
                                        onChange={(e) =>
                                            updateAddress(
                                                "pincode",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Pincode"
                                        className={inputClass}
                                    />
                                </Field>

                                <Field label="Country">
                                    <input
                                        type="text"
                                        value={
                                            address.country ?? ""
                                        }
                                        onChange={(e) =>
                                            updateAddress(
                                                "country",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Country"
                                        className={inputClass}
                                    />
                                </Field>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        SAVE
                    ================================================= */}

                    <button
                        type="submit"
                        disabled={mutating}
                        className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                        {mutating
                            ? "Saving..."
                            : "Save changes"}
                    </button>
                </form>
            </div>
        </section>
    );
}

/* =========================================================
   SHARED BITS
========================================================= */

export const inputClass =
    "w-full rounded-lg border border-strong bg-surface px-3 py-2.5 text-sm text-primary shadow-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent placeholder:text-muted";

export function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-primary">
                {label}
            </label>

            {children}
        </div>
    );
}

export function Banner({
    tone,
    children,
}: {
    tone: "danger" | "success";
    children: React.ReactNode;
}) {
    const cls =
        tone === "danger"
            ? "bg-danger-bg text-danger-text"
            : "bg-success-bg text-success-text";

    return (
        <div
            className={`mb-4 rounded-lg px-3 py-2.5 text-sm ${cls}`}
        >
            {children}
        </div>
    );
}

export function SectionIcon({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-secondary">
            {children}
        </span>
    );
}

/* =========================================================
   STORE ICON
========================================================= */

function StoreIcon() {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4"
            aria-hidden="true"
        >
            <path
                d="M3 8l1-4h12l1 4M3 8v7a1 1 0 001 1h3v-5h6v5h3a1 1 0 001-1V8M3 8h14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/* =========================================================
   MAP PIN ICON
========================================================= */

function MapPinIcon() {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4"
            aria-hidden="true"
        >
            <path
                d="M16 8.5c0 4.2-6 8.5-6 8.5S4 12.7 4 8.5a6 6 0 1112 0z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <circle
                cx="10"
                cy="8.5"
                r="2"
                stroke="currentColor"
                strokeWidth="1.5"
            />
        </svg>
    );
}