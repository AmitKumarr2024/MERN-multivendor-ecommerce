"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createShop } from "../store/shopSlice";
import { selectShopError, selectShopMutating } from "../store/shopSelectors";
import SlugAvailabilityField from "./Slugavailabilityfield";
import type { CreateShopPayload } from "../types/shop.types";

const emptyForm: CreateShopPayload = {
    shopName: "",
    slug: "",
    description: "",
    contactPhone: "",
    contactEmail: "",
    address: { street: "", city: "", state: "", pincode: "", country: "India" },
};

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
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
                    Set up your shop
                </h1>
                <p className="mb-6 mt-1 text-sm text-gray-500">
                    This creates your dukan — a public page buyers can browse. Your
                    account becomes a seller account once this is submitted.
                </p>

                {(error || localError) && (
                    <div className="mb-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
                        {localError || error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Shop name
                        </label>
                        <input
                            type="text"
                            value={form.shopName}
                            onChange={(e) => update("shopName", e.target.value)}
                            required
                            placeholder="e.g. Amit General Store"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                        />
                    </div>

                    <SlugAvailabilityField
                        value={form.slug ?? ""}
                        onChange={(v) => update("slug", v)}
                    />
                    <p className="-mt-3 text-xs text-gray-400">
                        Leave blank to auto-generate from your shop name.
                    </p>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) => update("description", e.target.value)}
                            rows={3}
                            placeholder="What do you sell?"
                            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Contact phone
                            </label>
                            <input
                                type="tel"
                                value={form.contactPhone}
                                onChange={(e) => update("contactPhone", e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Contact email
                            </label>
                            <input
                                type="email"
                                value={form.contactEmail}
                                onChange={(e) => update("contactEmail", e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                            />
                        </div>
                    </div>

                    <fieldset className="rounded-lg border border-gray-200 p-3">
                        <legend className="px-1 text-xs font-medium text-gray-500">
                            Address (optional)
                        </legend>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={form.address?.street}
                                onChange={(e) => updateAddress("street", e.target.value)}
                                placeholder="Street"
                                className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                            />
                            <input
                                type="text"
                                value={form.address?.city}
                                onChange={(e) => updateAddress("city", e.target.value)}
                                placeholder="City"
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                            />
                            <input
                                type="text"
                                value={form.address?.state}
                                onChange={(e) => updateAddress("state", e.target.value)}
                                placeholder="State"
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                            />
                            <input
                                type="text"
                                value={form.address?.pincode}
                                onChange={(e) => updateAddress("pincode", e.target.value)}
                                placeholder="Pincode"
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                            />
                            <input
                                type="text"
                                value={form.address?.country}
                                onChange={(e) => updateAddress("country", e.target.value)}
                                placeholder="Country"
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                            />
                        </div>
                    </fieldset>

                    <button
                        type="submit"
                        disabled={mutating}
                        className="w-full rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800 disabled:opacity-50 sm:w-auto"
                    >
                        {mutating ? "Creating shop..." : "Create shop"}
                    </button>
                </form>
            </div>
        </div>
    );
}