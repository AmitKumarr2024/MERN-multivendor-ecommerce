"use client";

import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateMyShop, toggleShopActive } from "../store/shopSlice";
import { selectShopError, selectShopMutating } from "../store/shopSelectors";
import type { Shop, UpdateShopPayload } from "../types/shop.types";

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
        contactPhone: shop.contactPhone ?? "",
        contactEmail: shop.contactEmail ?? "",
        address: shop.address ?? {},
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setForm({
            shopName: shop.shopName,
            description: shop.description ?? "",
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
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold text-gray-900">Shop details</h2>
                    <p className="mt-0.5 text-sm text-gray-500">
                        Visible to buyers on your public shop page.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleToggleActive}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        shop.isActive
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                >
                    {shop.isActive ? "● Live" : "○ Hidden"}
                </button>
            </div>

            {error ? (
                <div className="mb-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">{error}</div>
            ) : null}
            {saved ? (
                <div className="mb-4 rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-700">
                    Saved successfully.
                </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Shop name
                    </label>
                    <input
                        type="text"
                        value={form.shopName}
                        onChange={(e) => update("shopName", e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        value={form.description}
                        onChange={(e) => update("description", e.target.value)}
                        rows={3}
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

                <button
                    type="submit"
                    disabled={mutating}
                    className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800 disabled:opacity-50"
                >
                    {mutating ? "Saving..." : "Save changes"}
                </button>
            </form>
        </div>
    );
}