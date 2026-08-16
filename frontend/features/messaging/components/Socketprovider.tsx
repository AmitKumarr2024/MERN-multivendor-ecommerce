"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/features/auth/store/authSelector";
import { connectSocket, disconnectSocket } from "../../../services/socket";
import {
    receiveMessage,
    setPresence,
    setTyping,
    receiveShopBroadcast,
} from "../store/messagingSlice";
import { selectActiveConversationId } from "../store/messagingSelectors";
import type {
    Broadcast,
    IncomingMessageEvent,
    PresenceEvent,
    TypingEvent,
} from "../types/messaging.types";

const BROADCAST_TOAST_FN: Record<Broadcast["type"], typeof toast.info> = {
    info: toast.info,
    offer: toast.success,
    warning: toast.warning,
};

interface SocketProviderProps {
    children: React.ReactNode;
}

/**
 * Mounts once in the root layout (alongside ReduxProvider). Handles:
 *  - connecting/disconnecting the socket based on auth state
 *  - "message:new"        -> pushes into messagingSlice + toast if not on that thread
 *  - "typing:start/stop"  -> messagingSlice typing indicator state
 *  - "presence:online/offline" -> messagingSlice online-user set
 *  - "broadcast:platform" -> toast, shown on every page (admin site-wide announcement)
 *  - "broadcast:shop"     -> pushed into messagingSlice.shopBroadcasts (only relevant
 *                            while a component has called socket.emit("join:shop", slug),
 *                            e.g. the dukan page — see ShopBroadcastBanner)
 *  - "order:new" / "order:status-update" -> toast (seller gets new-order ping,
 *                            buyer gets status-change ping)
 */
export default function SocketProvider({ children }: SocketProviderProps) {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const activeConversationId = useAppSelector(selectActiveConversationId);

    useEffect(() => {
        if (!isAuthenticated) {
            disconnectSocket();
            return;
        }

        const socket = connectSocket();

        const handleNewMessage = (payload: IncomingMessageEvent) => {
            dispatch(receiveMessage(payload));
            if (payload.conversationId !== activeConversationId) {
                toast.message("New message", { description: payload.text.slice(0, 80) });
            }
        };

        const handleTypingStart = (payload: TypingEvent) => {
            dispatch(setTyping({ ...payload, typing: true }));
        };
        const handleTypingStop = (payload: TypingEvent) => {
            dispatch(setTyping({ ...payload, typing: false }));
        };

        const handlePresenceOnline = (payload: PresenceEvent) => {
            dispatch(setPresence({ userId: payload.userId, online: true }));
        };
        const handlePresenceOffline = (payload: PresenceEvent) => {
            dispatch(setPresence({ userId: payload.userId, online: false }));
        };

        const handlePlatformBroadcast = (broadcast: Broadcast) => {
            const toastFn = BROADCAST_TOAST_FN[broadcast.type] ?? toast.info;
            toastFn(broadcast.message);
        };

        const handleShopBroadcast = (broadcast: Broadcast) => {
            dispatch(receiveShopBroadcast(broadcast));
        };

        const handleNewOrder = (order: { grandTotal: number }) => {
            toast.success(`New order received — ₹${order.grandTotal.toLocaleString("en-IN")}`);
        };

        const handleOrderStatusUpdate = (update: { orderStatus: string; shopName: string }) => {
            toast.info(`${update.shopName}: order ${update.orderStatus}`);
        };

        socket.on("message:new", handleNewMessage);
        socket.on("typing:start", handleTypingStart);
        socket.on("typing:stop", handleTypingStop);
        socket.on("presence:online", handlePresenceOnline);
        socket.on("presence:offline", handlePresenceOffline);
        socket.on("broadcast:platform", handlePlatformBroadcast);
        socket.on("broadcast:shop", handleShopBroadcast);
        socket.on("order:new", handleNewOrder);
        socket.on("order:status-update", handleOrderStatusUpdate);

        return () => {
            socket.off("message:new", handleNewMessage);
            socket.off("typing:start", handleTypingStart);
            socket.off("typing:stop", handleTypingStop);
            socket.off("presence:online", handlePresenceOnline);
            socket.off("presence:offline", handlePresenceOffline);
            socket.off("broadcast:platform", handlePlatformBroadcast);
            socket.off("broadcast:shop", handleShopBroadcast);
            socket.off("order:new", handleNewOrder);
            socket.off("order:status-update", handleOrderStatusUpdate);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, dispatch]);

    return <>{children}</>;
}