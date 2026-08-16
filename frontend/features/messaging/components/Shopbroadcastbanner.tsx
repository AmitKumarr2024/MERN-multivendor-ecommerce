"use client";

import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchShopBroadcasts } from "../store/messagingSlice";
import { selectShopBroadcasts } from "../store/messagingSelectors";
import { getSocket } from "../../../services/socket";
import type { BroadcastType } from "../types/messaging.types";

interface ShopBroadcastBannerProps {
    shopSlug: string;
}

const TYPE_STYLES: Record<BroadcastType, string> = {
    offer: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
    info: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
};

/**
 * Usage on the public shop page:
 *
 *   <ShopBroadcastBanner shopSlug={shop.slug} />
 *
 * Fetches currently-active broadcasts on mount, then joins the
 * shop's socket room so anything the seller posts while this visitor
 * is on the page appears live (see SocketProvider's "broadcast:shop"
 * handler, which pushes into messagingSlice.shopBroadcasts).
 */
export default function ShopBroadcastBanner({ shopSlug }: ShopBroadcastBannerProps) {
    const dispatch = useAppDispatch();
    const broadcasts = useAppSelector(selectShopBroadcasts);
    const [dismissed, setDismissed] = useState<string[]>([]);

    useEffect(() => {
        dispatch(fetchShopBroadcasts(shopSlug));

        const socket = getSocket();
        socket.emit("join:shop", shopSlug);

        return () => {
            socket.emit("leave:shop", shopSlug);
        };
    }, [dispatch, shopSlug]);

    const visible = broadcasts.filter((b) => !dismissed.includes(b._id));

    if (visible.length === 0) return null;

    return (
        <div className="space-y-2">
            {visible.map((broadcast) => (
                <div
                    key={broadcast._id}
                    className={`flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm font-medium ${TYPE_STYLES[broadcast.type]}`}
                >
                    <span>{broadcast.message}</span>
                    <button
                        type="button"
                        onClick={() => setDismissed((d) => [...d, broadcast._id])}
                        className="shrink-0 opacity-60 hover:opacity-100"
                        aria-label="Dismiss"
                    >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
}