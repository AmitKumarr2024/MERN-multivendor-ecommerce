"use client";

import { useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateBusinessHours } from "../store/shopSlice";
import { selectShopError, selectShopMutating } from "../store/shopSelectors";
import type { BusinessHours, DayHours, DayName, Shop } from "../types/shop.types";

interface BusinessHoursEditorProps {
    shop: Shop;
}

const DAYS: { key: DayName; label: string }[] = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
];

export default function BusinessHoursEditor({ shop }: BusinessHoursEditorProps) {
    const dispatch = useAppDispatch();
    const mutating = useAppSelector(selectShopMutating);
    const error = useAppSelector(selectShopError);

    const [hours, setHours] = useState<BusinessHours>(shop.businessHours);
    const [dirty, setDirty] = useState(false);
    const [saved, setSaved] = useState(false);

    const updateDay = (day: DayName, changes: Partial<DayHours>) => {
        setHours((h) => ({ ...h, [day]: { ...h[day], ...changes } }));
        setDirty(true);
        setSaved(false);
    };

    const handleSave = async () => {
        const result = await dispatch(updateBusinessHours(hours));
        if (updateBusinessHours.fulfilled.match(result)) {
            setDirty(false);
            setSaved(true);
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-900">Business hours</h2>
                    <p className="mt-0.5 text-sm text-gray-500">
                        Shown as &quot;Open now&quot; / &quot;Closed&quot; on your shop page.
                    </p>
                </div>
                {dirty && (
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={mutating}
                        className="shrink-0 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {mutating ? "Saving..." : "Save"}
                    </button>
                )}
            </div>

            {error ? (
                <div className="mb-3 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">{error}</div>
            ) : null}
            {saved && !dirty ? (
                <div className="mb-3 rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-700">
                    Hours saved.
                </div>
            ) : null}

            <div className="divide-y divide-gray-100">
                {DAYS.map(({ key, label }) => {
                    const day = hours[key];
                    return (
                        <div
                            key={key}
                            className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4"
                        >
                            <span className="w-24 shrink-0 text-sm font-medium text-gray-700">
                                {label}
                            </span>

                            <label className="flex items-center gap-2 text-xs text-gray-500">
                                <input
                                    type="checkbox"
                                    checked={!day.isClosed}
                                    onChange={(e) => updateDay(key, { isClosed: !e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                Open
                            </label>

                            {!day.isClosed ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="time"
                                        value={day.open}
                                        onChange={(e) => updateDay(key, { open: e.target.value })}
                                        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
                                    />
                                    <span className="text-xs text-gray-400">to</span>
                                    <input
                                        type="time"
                                        value={day.close}
                                        onChange={(e) => updateDay(key, { close: e.target.value })}
                                        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:border-gray-900 focus:outline-none"
                                    />
                                </div>
                            ) : (
                                <span className="text-xs font-medium text-gray-400">Closed all day</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}