"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createShop } from "../store/shopSlice";
import { selectShopError, selectShopMutating } from "../store/shopSelectors";
import SlugAvailabilityField from "./Slugavailabilityfield";
import type { CreateShopPayload } from "../types/shop.types";
import { ImageUploadField } from "@/features/upload";

const emptyForm: CreateShopPayload = {
    shopName: "",
    slug: "",
    description: "",
    contactPhone: "",
    contactEmail: "",
    address: { street: "", city: "", state: "", pincode: "", country: "India" },
};

const inputClass =
    "w-full rounded-lg border border-default bg-surface px-3 py-2.5 text-sm text-primary shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:border-zinc-100 dark:focus:ring-zinc-100";
const smallInputClass =
    "rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary focus:border-zinc-900 focus:outline-none dark:focus:border-zinc-100";
const labelClass = "mb-1.5 block text-sm font-medium text-primary";

export default function CreateShopForm() {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const mutating = useAppSelector(selectShopMutating);
    const error = useAppSelector(selectShopError);

    const [form, setForm] = useState<CreateShopPayload>(emptyForm);
    const [localError, setLocalError] = useState<string | null>(null);

    const update = <K extends keyof CreateShopPayload>(key: K, value: CreateShopPayload[K]) => {
        setForm((f) => ({ ...f, [key]: value }));
    };

    const updateAddress = (key: keyof NonNullable<CreateShopPayload["address"]>, value: string) => {
        setForm((f) => ({ ...f, address: { ...f.address, [key]: value } }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!form.shopName.trim()) {
            setLocalError("Shop name is required.");
            return;
        }

        const payload: CreateShopPayload = {
            ...form,
            slug: form.slug?.trim().toLowerCase() || undefined,
            contactEmail: form.contactEmail?.trim() || undefined,
            contactPhone: form.contactPhone?.trim() || undefined,
        };

        const result = await dispatch(createShop(payload));
        if (createShop.fulfilled.match(result)) {
            router.push("/seller/shop");
        }
    };

    return (
        <div className="mx-auto max-w-2xl p-4 sm:p-6">
            <div className="rounded-2xl border border-default bg-surface p-4 shadow-sm sm:p-6">
                <h1 className="text-lg font-semibold text-primary sm:text-xl">
                    Set up your shop
                </h1>
                <p className="mb-6 mt-1 text-sm text-secondary">
                    This creates your dukan — a public page buyers can browse. Your
                    account becomes a seller account once this is submitted.
                </p>

                {(error || localError) && (
                    <div className="mb-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                        {localError || error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className={labelClass}>Shop name</label>
                        <input
                            type="text"
                            value={form.shopName}
                            onChange={(e) => update("shopName", e.target.value)}
                            required
                            placeholder="e.g. Amit General Store"
                            className={inputClass}
                        />
                    </div>
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



                    <SlugAvailabilityField
                        value={form.slug ?? ""}
                        onChange={(v) => update("slug", v)}
                    />
                    <p className="-mt-3 text-xs text-muted">
                        Leave blank to auto-generate from your shop name.
                    </p>

                    <div>
                        <label className={labelClass}>Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => update("description", e.target.value)}
                            rows={3}
                            placeholder="What do you sell?"
                            className={`${inputClass} resize-none`}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Contact phone</label>
                            <input
                                type="tel"
                                value={form.contactPhone}
                                onChange={(e) => update("contactPhone", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Contact email</label>
                            <input
                                type="email"
                                value={form.contactEmail}
                                onChange={(e) => update("contactEmail", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <fieldset className="rounded-lg border border-default p-3">
                        <legend className="px-1 text-xs font-medium text-secondary">
                            Address (optional)
                        </legend>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={form.address?.street}
                                onChange={(e) => updateAddress("street", e.target.value)}
                                placeholder="Street"
                                className={`col-span-2 ${smallInputClass}`}
                            />
                            <input
                                type="text"
                                value={form.address?.city}
                                onChange={(e) => updateAddress("city", e.target.value)}
                                placeholder="City"
                                className={smallInputClass}
                            />
                            <input
                                type="text"
                                value={form.address?.state}
                                onChange={(e) => updateAddress("state", e.target.value)}
                                placeholder="State"
                                className={smallInputClass}
                            />
                            <input
                                type="text"
                                value={form.address?.pincode}
                                onChange={(e) => updateAddress("pincode", e.target.value)}
                                placeholder="Pincode"
                                className={smallInputClass}
                            />
                            <input
                                type="text"
                                value={form.address?.country}
                                onChange={(e) => updateAddress("country", e.target.value)}
                                placeholder="Country"
                                className={smallInputClass}
                            />
                        </div>
                    </fieldset>

                    <button
                        type="submit"
                        disabled={mutating}
                        className="w-full rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white sm:w-auto"
                    >
                        {mutating ? "Creating shop..." : "Create shop"}
                    </button>
                </form>
            </div>
        </div>
    );
}