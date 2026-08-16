"use client";

import { useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createShopBroadcast, deactivateBroadcast } from "../store/messagingSlice";
import { selectMessagingError, selectShopBroadcasts } from "../store/messagingSelectors";
import type { BroadcastType } from "../types/messaging.types";

const TYPE_OPTIONS: { value: BroadcastType; label: string }[] = [
    { value: "offer", label: "Offer" },
    { value: "info", label: "Info" },
    { value: "warning", label: "Warning" },
];

export default function SellerBroadcastForm() {
    const dispatch = useAppDispatch();
    const broadcasts = useAppSelector(selectShopBroadcasts);
    const error = useAppSelector(selectMessagingError);

    const [message, setMessage] = useState("");
    const [type, setType] = useState<BroadcastType>("offer");
    const [posting, setPosting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = message.trim();
        if (!trimmed) return;

        setPosting(true);
        const result = await dispatch(createShopBroadcast({ message: trimmed, type }));
        setPosting(false);

        if (createShopBroadcast.fulfilled.match(result)) {
            setMessage("");
        }
    };

    return (
        <section className="rounded-2xl border border-default bg-surface p-4 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-secondary">
                    <MegaphoneIcon />
                </span>
                <div>
                    <h2 className="text-sm font-semibold text-primary sm:text-base">Shop announcements</h2>
                    <p className="mt-0.5 text-xs text-secondary sm:text-sm">
                        Posted live to visitors currently on your shop page.
                    </p>
                </div>
            </div>

            {error ? (
                <div className="mt-4 rounded-lg bg-danger-bg px-3 py-2.5 text-sm text-danger-text">{error}</div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={300}
                    placeholder="e.g. Flat 20% off today only!"
                    className="flex-1 rounded-lg border border-strong bg-surface px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none"
                />
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as BroadcastType)}
                    className="rounded-lg border border-strong bg-surface px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none"
                >
                    {TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <button
                    type="submit"
                    disabled={!message.trim() || posting}
                    className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                    {posting ? "Posting..." : "Post"}
                </button>
            </form>

            {broadcasts.length > 0 && (
                <ul className="mt-4 space-y-2">
                    {broadcasts.map((b) => (
                        <li
                            key={b._id}
                            className="flex items-center justify-between gap-3 rounded-lg bg-surface-muted px-3 py-2 text-sm"
                        >
                            <span className="text-primary">{b.message}</span>
                            <button
                                type="button"
                                onClick={() => dispatch(deactivateBroadcast(b._id))}
                                className="shrink-0 text-xs font-medium text-danger-text hover:opacity-80"
                            >
                                Take down
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

function MegaphoneIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M3 8v4l4 1v3a1 1 0 001 1h1v-4l8 2V6L9 8H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
    );
}