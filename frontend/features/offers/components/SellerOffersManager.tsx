"use client";

import { useEffect, useState } from "react";
import { Plus, Tag, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createOffer, deleteOffer, fetchShopOffers, updateOffer } from "../store/offerSlice";
import { selectOfferError, selectOfferMutating, selectShopOffers } from "../store/offerSelectors";
import type { CreateOfferPayload, DiscountType, OfferScope } from "../types/offer.types";

const emptyForm: CreateOfferPayload = {
    code: "", description: "", discountType: "percentage", discountValue: 10,
    minOrderValue: 0, scope: "shop", perCustomerLimit: 1, isActive: true,
};

export default function SellerOffersManager({ shopId }: { shopId: string }) {
    const dispatch = useAppDispatch();
    const offers = useAppSelector(selectShopOffers);
    const mutating = useAppSelector(selectOfferMutating);
    const error = useAppSelector(selectOfferError);

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<CreateOfferPayload>(emptyForm);

    useEffect(() => { dispatch(fetchShopOffers(shopId)); }, [dispatch, shopId]);

    const update = <K extends keyof CreateOfferPayload>(key: K, value: CreateOfferPayload[K]) => {
        setForm((f) => ({ ...f, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await dispatch(createOffer({ shopId, payload: form }));
        if (createOffer.fulfilled.match(result)) { setForm(emptyForm); setShowForm(false); }
    };

    const handleToggleActive = (id: string, isActive: boolean) => {
        dispatch(updateOffer({ shopId, id, isActive: !isActive }));
    };

    const handleDelete = (id: string) => {
        if (confirm("Delete this offer? This can't be undone.")) dispatch(deleteOffer({ shopId, id }));
    };

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-base font-bold text-primary">Offers & coupons</h2>
                    <p className="text-xs text-secondary">Create promotional codes buyers can apply at checkout.</p>
                </div>
                <button type="button" onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-xs font-semibold text-accent-foreground hover:opacity-90">
                    <Plus className="h-3.5 w-3.5" /> New offer
                </button>
            </div>

            {error && <div className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger-text">{error}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-default bg-surface p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-sm font-medium text-primary">Code
                            <input value={form.code} onChange={(e) => update("code", e.target.value.toUpperCase())} required placeholder="SAVE10"
                                className="mt-1 w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm uppercase text-primary" />
                        </label>
                        <label className="text-sm font-medium text-primary">Scope
                            <select value={form.scope} onChange={(e) => update("scope", e.target.value as OfferScope)}
                                className="mt-1 w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary">
                                <option value="shop">Entire shop</option>
                                <option value="category">Specific category</option>
                                <option value="product">Specific product</option>
                            </select>
                        </label>
                        <label className="text-sm font-medium text-primary">Discount type
                            <select value={form.discountType} onChange={(e) => update("discountType", e.target.value as DiscountType)}
                                className="mt-1 w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary">
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed amount</option>
                            </select>
                        </label>
                        <label className="text-sm font-medium text-primary">Discount value
                            <input type="number" min={0} value={form.discountValue} onChange={(e) => update("discountValue", Number(e.target.value))} required
                                className="mt-1 w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary" />
                        </label>
                        <label className="text-sm font-medium text-primary">Minimum order value
                            <input type="number" min={0} value={form.minOrderValue} onChange={(e) => update("minOrderValue", Number(e.target.value))}
                                className="mt-1 w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary" />
                        </label>
                        {form.discountType === "percentage" && (
                            <label className="text-sm font-medium text-primary">Max discount amount
                                <input type="number" min={0} value={form.maxDiscountAmount ?? ""} onChange={(e) => update("maxDiscountAmount", e.target.value ? Number(e.target.value) : undefined)}
                                    className="mt-1 w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary" />
                            </label>
                        )}
                        <label className="text-sm font-medium text-primary">Usage limit (total)
                            <input type="number" min={1} value={form.usageLimit ?? ""} onChange={(e) => update("usageLimit", e.target.value ? Number(e.target.value) : undefined)} placeholder="Unlimited"
                                className="mt-1 w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary" />
                        </label>
                        <label className="text-sm font-medium text-primary">Per-customer limit
                            <input type="number" min={1} value={form.perCustomerLimit} onChange={(e) => update("perCustomerLimit", Number(e.target.value))}
                                className="mt-1 w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary" />
                        </label>
                        <label className="text-sm font-medium text-primary">Start date
                            <input type="date" onChange={(e) => update("startDate", e.target.value || undefined)}
                                className="mt-1 w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary" />
                        </label>
                        <label className="text-sm font-medium text-primary">End date
                            <input type="date" onChange={(e) => update("endDate", e.target.value || undefined)}
                                className="mt-1 w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary" />
                        </label>
                    </div>
                    <label className="block text-sm font-medium text-primary">Description (optional)
                        <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={2}
                            className="mt-1 w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary" />
                    </label>
                    <button type="submit" disabled={mutating} className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-50">
                        {mutating ? "Saving..." : "Create offer"}
                    </button>
                </form>
            )}

            <div className="divide-y divide-default overflow-hidden rounded-2xl border border-default bg-surface">
                {offers.length === 0 ? (
                    <p className="p-6 text-center text-sm text-secondary">No offers yet.</p>
                ) : (
                    offers.map((offer) => (
                        <div key={offer._id} className="flex items-center justify-between gap-3 p-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                                    <Tag className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-primary">
                                        {offer.code} · {offer.discountType === "percentage" ? `${offer.discountValue}%` : `₹${offer.discountValue}`} off
                                    </p>
                                    <p className="truncate text-xs text-muted">
                                        {offer.scope} · used {offer.usedCount}{offer.usageLimit ? `/${offer.usageLimit}` : ""}
                                    </p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <button type="button" onClick={() => handleToggleActive(offer._id, offer.isActive)}
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${offer.isActive ? "bg-success-bg text-success-text" : "bg-surface-muted text-secondary"}`}>
                                    {offer.isActive ? "Active" : "Inactive"}
                                </button>
                                <button type="button" onClick={() => handleDelete(offer._id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-danger-text hover:bg-danger-bg" aria-label="Delete offer">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}