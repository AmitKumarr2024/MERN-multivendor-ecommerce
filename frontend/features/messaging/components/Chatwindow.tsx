"use client";

import { useEffect, useRef, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCurrentUser } from "@/features/auth/store/authSelector";
import { fetchMessages, sendMessage, setActiveConversation } from "../store/messagingSlice";
import {
    selectMessagesForConversation,
    selectMessagesLoading,
    selectSendingMessage,
    selectTypingUsers,
} from "../store/messagingSelectors";
import { getSocket } from "../../../services/socket";
import type { Conversation } from "../types/messaging.types";
import MessageBubble from "./Messagebubble";
import TypingIndicator from "./Typingindicator";

interface ChatWindowProps {
    conversation: Conversation;
    onBack?: () => void;
}

const TYPING_STOP_DELAY = 1500;

export default function ChatWindow({ conversation, onBack }: ChatWindowProps) {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectCurrentUser);
    const messages = useAppSelector(selectMessagesForConversation(conversation._id));
    const loading = useAppSelector(selectMessagesLoading);
    const sending = useAppSelector(selectSendingMessage);
    const typingUserIds = useAppSelector(selectTypingUsers(conversation._id));

    const [text, setText] = useState("");
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const shop = typeof conversation.shop === "string" ? null : conversation.shop;
    const buyer = typeof conversation.buyer === "string" ? null : conversation.buyer;
    const isSeller = user?.role === "seller";
    const title = isSeller ? buyer?.name ?? "Buyer" : shop?.shopName ?? "Shop";
    const otherPartyTyping = typingUserIds.some((id) => id !== user?._id);

    // Join/leave the socket room for this conversation, fetch history.
    useEffect(() => {
        dispatch(fetchMessages(conversation._id));
        dispatch(setActiveConversation(conversation._id));

        const socket = getSocket();
        socket.emit("join:conversation", conversation._id);

        return () => {
            socket.emit("leave:conversation", conversation._id);
            dispatch(setActiveConversation(null));
        };
    }, [dispatch, conversation._id]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length, otherPartyTyping]);

    const emitTyping = (typing: boolean) => {
        const socket = getSocket();
        socket.emit(typing ? "typing:start" : "typing:stop", conversation._id);
    };

    const handleChange = (value: string) => {
        setText(value);
        emitTyping(true);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => emitTyping(false), TYPING_STOP_DELAY);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || sending) return;

        setText("");
        emitTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        await dispatch(sendMessage({ conversationId: conversation._id, text: trimmed }));
    };

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-default px-4 py-3">
                {onBack && (
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-secondary hover:bg-surface-hover md:hidden"
                        aria-label="Back"
                    >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                            <path
                                fillRule="evenodd"
                                d="M12.79 4.21a.75.75 0 0 1 0 1.06L8.06 10l4.73 4.73a.75.75 0 1 1-1.06 1.06l-5.26-5.26a.75.75 0 0 1 0-1.06l5.26-5.26a.75.75 0 0 1 1.06 0Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                )}
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {title.charAt(0).toUpperCase()}
                </div>
                <p className="text-sm font-medium text-primary">{title}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {loading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-10 w-2/5 animate-pulse rounded-2xl bg-surface-muted ${i % 2 ? "ml-auto" : ""}`}
                            />
                        ))}
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <MessageBubble
                                key={message._id}
                                message={message}
                                isOwn={message.sender === user?._id}
                            />
                        ))}
                        {otherPartyTyping && <TypingIndicator />}
                        <div ref={bottomRef} />
                    </>
                )}
            </div>

            {/* Composer */}
            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-default p-3">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-full border border-default bg-surface px-4 py-2.5 text-sm focus:border-zinc-900 focus:outline-none dark:focus:border-zinc-100"
                />
                <button
                    type="submit"
                    disabled={!text.trim() || sending}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white transition-colors hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    aria-label="Send"
                >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path d="M3.4 2.6 17.7 9.1a1 1 0 0 1 0 1.8L3.4 17.4a1 1 0 0 1-1.4-1.1L4.2 10 2 3.7a1 1 0 0 1 1.4-1.1Z" />
                    </svg>
                </button>
            </form>
        </div>
    );
}