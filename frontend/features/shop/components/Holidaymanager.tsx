"use client";

import { useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateHolidayDates } from "../store/shopSlice";
import { selectShopError } from "../store/shopSelectors";
import type { Shop } from "../types/shop.types";

interface HolidayManagerProps {
    shop: Shop;
}

export default function HolidayManager({ shop }: HolidayManagerProps) {
    const dispatch = useAppDispatch();
    const error = useAppSelector(selectShopError);

    const [newDate, setNewDate] = useState("");
    const [busyDate, setBusyDate] = useState<string | null>(null);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDate) return;
        setBusyDate(newDate);
        await dispatch(updateHolidayDates({ action: "add", date: newDate }));
        setBusyDate(null);
        setNewDate("");
    };

    const handleRemove = async (date: string) => {
        setBusyDate(date);
        await dispatch(updateHolidayDates({ action: "remove", date }));
        setBusyDate(null);
    };

    const sortedDates = [...shop.holidayDates].sort();

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold text-gray-900">Holiday dates</h2>
            <p className="mt-0.5 text-sm text-gray-500">
                Festivals or personal leave — shop shows as closed on these dates.
            </p>

            {error ? (
                <div className="mt-3 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">{error}</div>
            ) : null}

            <form onSubmit={handleAdd} className="mt-4 flex gap-2">
                <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={!newDate || busyDate === newDate}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                    Add
                </button>
            </form>

            {sortedDates.length === 0 ? (
                <p className="mt-4 text-sm text-gray-400">No holiday dates added yet.</p>
            ) : (
                <ul className="mt-4 flex flex-wrap gap-2">
                    {sortedDates.map((date) => (
                        <li
                            key={date}
                            className="flex items-center gap-2 rounded-full bg-gray-100 py-1.5 pl-3 pr-2 text-xs font-medium text-gray-700"
                        >
                            {new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })}
                            <button
                                type="button"
                                onClick={() => handleRemove(date)}
                                disabled={busyDate === date}
                                className="flex h-4 w-4 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50"
                                aria-label={`Remove ${date}`}
                            >
                                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                                </svg>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}