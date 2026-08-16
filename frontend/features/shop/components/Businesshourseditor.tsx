"use client";

import { useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateBusinessHours } from "../store/shopSlice";
import { selectShopError, selectShopMutating } from "../store/shopSelectors";
import { Banner, SectionIcon } from "./Shopsettingsform";
import type { BusinessHours, DayHours, DayName, Shop } from "../types/shop.types";

interface BusinessHoursEditorProps {
    shop: Shop;
}

const DAYS: { key: DayName; label: string; short: string }[] = [
    { key: "monday", label: "Monday", short: "Mon" },
    { key: "tuesday", label: "Tuesday", short: "Tue" },
    { key: "wednesday", label: "Wednesday", short: "Wed" },
    { key: "thursday", label: "Thursday", short: "Thu" },
    { key: "friday", label: "Friday", short: "Fri" },
    { key: "saturday", label: "Saturday", short: "Sat" },
    { key: "sunday", label: "Sunday", short: "Sun" },
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
        <section className="rounded-2xl border border-default bg-surface p-4 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <SectionIcon><ClockIcon /></SectionIcon>
                    <div>
                        <h2 className="text-sm font-semibold text-primary sm:text-base">Business hours</h2>
                        <p className="mt-0.5 text-xs text-secondary sm:text-sm">
                            Shown as &quot;Open now&quot; / &quot;Closed&quot; on your shop page.
                        </p>
                    </div>
                </div>
                {dirty && (
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={mutating}
                        className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {mutating ? "Saving..." : "Save"}
                    </button>
                )}
            </div>

            <div className="mt-4">
                {error ? <Banner tone="danger">{error}</Banner> : null}
                {saved && !dirty ? <Banner tone="success">Hours saved.</Banner> : null}
            </div>

            <div className="divide-y divide-default">
                {DAYS.map(({ key, label, short }) => {
                    const day = hours[key];
                    return (
                        <div
                            key={key}
                            className="flex flex-col gap-2.5 py-3.5 sm:flex-row sm:items-center sm:gap-4"
                        >
                            <div className="flex items-center justify-between sm:w-28 sm:shrink-0 sm:justify-start">
                                <span className="text-sm font-medium text-primary">
                                    <span className="sm:hidden">{label}</span>
                                    <span className="hidden sm:inline">{short}</span>
                                </span>

                                <label className="flex items-center gap-2 text-xs text-secondary sm:hidden">
                                    <input
                                        type="checkbox"
                                        checked={!day.isClosed}
                                        onChange={(e) => updateDay(key, { isClosed: !e.target.checked })}
                                        className="h-4 w-4 rounded border-strong accent-accent"
                                    />
                                    Open
                                </label>
                            </div>

                            <label className="hidden items-center gap-2 text-xs text-secondary sm:flex">
                                <input
                                    type="checkbox"
                                    checked={!day.isClosed}
                                    onChange={(e) => updateDay(key, { isClosed: !e.target.checked })}
                                    className="h-4 w-4 rounded border-strong accent-accent"
                                />
                                Open
                            </label>

                            {!day.isClosed ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="time"
                                        value={day.open}
                                        onChange={(e) => updateDay(key, { open: e.target.value })}
                                        className="rounded-lg border border-strong bg-surface px-2.5 py-1.5 text-sm text-primary focus:border-accent focus:outline-none"
                                    />
                                    <span className="text-xs text-muted">to</span>
                                    <input
                                        type="time"
                                        value={day.close}
                                        onChange={(e) => updateDay(key, { close: e.target.value })}
                                        className="rounded-lg border border-strong bg-surface px-2.5 py-1.5 text-sm text-primary focus:border-accent focus:outline-none"
                                    />
                                </div>
                            ) : (
                                <span className="text-xs font-medium text-muted">Closed all day</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

function ClockIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}