"use client";

import { Inbox, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
    fetchMyConversations,
    setActiveConversation,
} from "../store/messagingSlice";

import {
    selectConversations,
    selectConversationsLoading,
} from "../store/messagingSelectors";

import { selectUserRole } from "@/features/auth/store/authSelector";

import type { Conversation } from "../types/messaging.types";

interface ConversationListProps {
    activeId: string | null;
    onSelect: (
        conversation: Conversation,
    ) => void;
}

export default function ConversationList({
    activeId,
    onSelect,
}: ConversationListProps) {
    const dispatch = useAppDispatch();

    const conversations = useAppSelector(
        selectConversations,
    );

    const loading = useAppSelector(
        selectConversationsLoading,
    );

    const role = useAppSelector(
        selectUserRole,
    );

    const isSeller =
        role === "seller";

    const [search, setSearch] =
        useState("");

    useEffect(() => {
        dispatch(
            fetchMyConversations(),
        );
    }, [dispatch]);

    const filteredConversations =
        useMemo(() => {
            const query =
                search.trim().toLowerCase();

            if (!query) {
                return conversations;
            }

            return conversations.filter(
                (conversation) => {
                    const shop =
                        typeof conversation.shop ===
                            "string"
                            ? null
                            : conversation.shop;

                    const buyer =
                        typeof conversation.buyer ===
                            "string"
                            ? null
                            : conversation.buyer;

                    const title = isSeller
                        ? buyer?.name ??
                        "Buyer"
                        : shop?.shopName ??
                        "Shop";

                    const lastMessage =
                        conversation.lastMessage
                            ?.text ?? "";

                    return (
                        title
                            .toLowerCase()
                            .includes(
                                query,
                            ) ||
                        lastMessage
                            .toLowerCase()
                            .includes(
                                query,
                            )
                    );
                },
            );
        }, [
            conversations,
            search,
            isSeller,
        ]);

    const handleSelect = (
        conversation: Conversation,
    ) => {
        dispatch(
            setActiveConversation(
                conversation._id,
            ),
        );

        onSelect(conversation);
    };

    return (
        <div className="flex h-full min-h-0 flex-col">
            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="shrink-0 border-b border-default px-4 py-4 sm:px-5">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-sm font-bold text-primary">
                            Inbox
                        </h2>

                        <p className="mt-0.5 text-xs text-muted">
                            {conversations.length}{" "}
                            conversation
                            {conversations.length !==
                                1
                                ? "s"
                                : ""}
                        </p>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted">
                        <Inbox className="h-4 w-4 text-secondary" />
                    </div>
                </div>

                {/* Search */}
                <div className="relative mt-4">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

                    <input
                        type="search"
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target
                                    .value,
                            )
                        }
                        placeholder="Search conversations..."
                        className="
                            h-10
                            w-full
                            rounded-xl
                            border border-default
                            bg-surface-muted/50
                            pl-9 pr-3
                            text-xs
                            text-primary
                            outline-none
                            transition-all
                            placeholder:text-muted
                            hover:border-strong
                            focus:border-accent
                            focus:bg-surface
                            focus:ring-4
                            focus:ring-accent/10
                        "
                    />
                </div>
            </div>

            {/* ==================================================
                LIST
            ================================================== */}

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {loading ? (
                    <ConversationSkeleton />
                ) : filteredConversations.length ===
                    0 ? (
                    <EmptyConversationState
                        searching={
                            Boolean(
                                search.trim(),
                            )
                        }
                    />
                ) : (
                    <div className="space-y-1">
                        {filteredConversations.map(
                            (
                                conversation,
                            ) => {
                                const shop =
                                    typeof conversation.shop ===
                                        "string"
                                        ? null
                                        : conversation.shop;

                                const buyer =
                                    typeof conversation.buyer ===
                                        "string"
                                        ? null
                                        : conversation.buyer;

                                const title =
                                    isSeller
                                        ? buyer?.name ??
                                        "Buyer"
                                        : shop?.shopName ??
                                        "Shop";

                                const unread =
                                    isSeller
                                        ? conversation.unreadCountForSeller
                                        : conversation.unreadCountForBuyer;

                                const isActive =
                                    activeId ===
                                    conversation._id;

                                const avatar =
                                    title
                                        .charAt(
                                            0,
                                        )
                                        .toUpperCase();

                                return (
                                    <button
                                        key={
                                            conversation._id
                                        }
                                        type="button"
                                        onClick={() =>
                                            handleSelect(
                                                conversation,
                                            )
                                        }
                                        className={`
                                            group
                                            relative
                                            flex
                                            w-full
                                            items-center
                                            gap-3
                                            rounded-xl
                                            px-3
                                            py-3
                                            text-left
                                            transition-all
                                            ${isActive
                                                ? "bg-accent/10"
                                                : "hover:bg-surface-hover"
                                            }
                                        `}
                                    >
                                        {/* Active indicator */}
                                        {isActive && (
                                            <span className="absolute bottom-2 top-2 left-0 w-0.5 rounded-full bg-accent" />
                                        )}

                                        {/* Avatar */}
                                        <div
                                            className={`
                                                relative
                                                flex
                                                h-11
                                                w-11
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-full
                                                text-xs
                                                font-bold
                                                ${isActive
                                                    ? "bg-accent text-accent-foreground"
                                                    : "bg-surface-muted text-secondary"
                                                }
                                            `}
                                        >
                                            {avatar}

                                            {unread >
                                                0 && (
                                                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-surface bg-accent px-0.5 text-[9px] font-bold text-accent-foreground">
                                                        {unread >
                                                            9
                                                            ? "9+"
                                                            : unread}
                                                    </span>
                                                )}
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p
                                                    className={`
                                                        min-w-0
                                                        flex-1
                                                        truncate
                                                        text-sm
                                                        ${unread >
                                                            0
                                                            ? "font-bold text-primary"
                                                            : "font-medium text-primary"
                                                        }
                                                    `}
                                                >
                                                    {
                                                        title
                                                    }
                                                </p>

                                                {conversation.lastMessage?.sentAt && (
                                                    <span className="shrink-0 text-[10px] text-muted">
                                                        {formatTime(
                                                            conversation.lastMessage.sentAt,
                                                        )}
                                                    </span>
                                                )}
                                            </div>

                                            <p
                                                className={`
                                                    mt-1
                                                    truncate
                                                    text-xs
                                                    ${unread >
                                                        0
                                                        ? "font-medium text-secondary"
                                                        : "text-muted"
                                                    }
                                                `}
                                            >
                                                {conversation
                                                    .lastMessage
                                                    ?.text ??
                                                    "No messages yet"}
                                            </p>
                                        </div>
                                    </button>
                                );
                            },
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ================================================================
   SKELETON
================================================================ */

function ConversationSkeleton() {
    return (
        <div className="space-y-1">
            {Array.from({
                length: 7,
            }).map((_, index) => (
                <div
                    key={index}
                    className="flex animate-pulse items-center gap-3 rounded-xl px-3 py-3"
                >
                    <div className="h-11 w-11 shrink-0 rounded-full bg-surface-muted" />

                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-3 w-2/5 rounded bg-surface-muted" />
                        <div className="h-2.5 w-4/5 rounded bg-surface-muted" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ================================================================
   EMPTY
================================================================ */

function EmptyConversationState({
    searching,
}: {
    searching: boolean;
}) {
    return (
        <div className="flex h-full min-h-64 flex-col items-center justify-center px-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted">
                <Inbox className="h-5 w-5 text-muted" />
            </div>

            <p className="mt-4 text-sm font-semibold text-primary">
                {searching
                    ? "No conversations found"
                    : "No conversations yet"}
            </p>

            <p className="mt-1 max-w-xs text-xs leading-5 text-muted">
                {searching
                    ? "Try searching for another customer or shop."
                    : "Your conversations will appear here when you start chatting."}
            </p>
        </div>
    );
}

/* ================================================================
   TIME
================================================================ */

function formatTime(
    value: string,
) {
    return new Date(
        value,
    ).toLocaleTimeString(
        "en-IN",
        {
            hour: "numeric",
            minute: "2-digit",
        },
    );
}