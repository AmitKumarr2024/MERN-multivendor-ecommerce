export interface MessageBuyerRef {
    _id: string;
    name: string;
}

export interface MessageShopRef {
    _id: string;
    shopName: string;
    slug: string;
    logo?: string;
}
export interface MessageSellerRef {
    _id: string;
    name: string;
}

export interface Conversation {
    _id: string;
    buyer: MessageBuyerRef | string;
    seller: MessageSellerRef | string; // <-- add this ONLY if backend returns it
    shop: MessageShopRef | string;

    lastMessage?: {
        text: string;
        sentBy: string;
        sentAt: string;
    };

    unreadCountForBuyer: number;
    unreadCountForSeller: number;

    createdAt: string;
    updatedAt: string;
}

export interface Message {
    _id: string;
    conversation: string;
    sender: string;
    text: string;
    readAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export type BroadcastType = "info" | "offer" | "warning";
export type BroadcastScope = "shop" | "platform";

export interface Broadcast {
    _id: string;
    scope: BroadcastScope;
    shop: string | null;
    createdBy: string;
    message: string;
    type: BroadcastType;
    isActive: boolean;
    expiresAt: string | null;
    createdAt: string;
}

/* =========================================================
   PAYLOADS
========================================================= */

export interface SendMessagePayload {
    conversationId: string;
    text: string;
}

export interface CreateShopBroadcastPayload {
    message: string;
    type?: BroadcastType;
    expiresAt?: string;
}

export interface CreatePlatformBroadcastPayload {
    message: string;
    type?: BroadcastType;
    expiresAt?: string;
}

/* =========================================================
   SOCKET EVENT PAYLOADS (from sockets/emit.js)
========================================================= */

export interface IncomingMessageEvent extends Message {
    conversationId: string;
}

export interface TypingEvent {
    conversationId: string;
    userId: string;
}

export interface PresenceEvent {
    userId: string;
}