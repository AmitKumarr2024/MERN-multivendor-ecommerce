"use client";

import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyConversations, setActiveConversation } from "../store/messagingSlice";
import { selectConversations, selectConversationsLoading } from "../store/messagingSelectors";
import { selectUserRole } from "@/features/auth/store/authSelector";
import type { Conversation } from "../types/messaging.types";

interface ConversationListProps {
    activeId: string | null;
    onSelect: (conversation: Conversation) => void;
}

export default function ConversationList({ activeId, onSelect }: ConversationListProps) {
    const dispatch = useAppDispatch();
    const conversations = useAppSelector(selectConversations);
    const loading = useAppSelector(selectConversationsLoading);
    const role = useAppSelector(selectUserRole);
    const isSeller = role === "seller";

    useEffect(() => {
        dispatch(fetchMyConversations());
    }, [dispatch]);

    const handleSelect = (conversation: Conversation) => {
        dispatch(setActiveConversation(conversation._id));
        onSelect(conversation);
    };

    if (loading) {
        return (
            <div className="space-y-2 p-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-muted" />
                ))}
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="p-6 text-center text-sm text-muted">No conversations yet.</div>
        );
    }

    return (
        <div className="divide-y divide-default overflow-y-auto">
            {conversations.map((conversation) => {
                const shop = typeof conversation.shop === "string" ? null : conversation.shop;
                const buyer = typeof conversation.buyer === "string" ? null : conversation.buyer;
                const title = isSeller ? buyer?.name ?? "Buyer" : shop?.shopName ?? "Shop";
                const unread = isSeller
                    ? conversation.unreadCountForSeller
                    : conversation.unreadCountForBuyer;

                return (
                    <button
                        key={conversation._id}
                        type="button"
                        onClick={() => handleSelect(conversation)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover ${
                            activeId === conversation._id ? "bg-surface-hover" : ""
                        }`}
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                            {title.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-medium text-primary">{title}</p>
                                {unread > 0 && (
                                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                                        {unread}
                                    </span>
                                )}
                            </div>
                            <p className="truncate text-xs text-muted">
                                {conversation.lastMessage?.text ?? "No messages yet"}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}