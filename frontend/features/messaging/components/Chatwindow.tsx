"use client";

import {
    ArrowLeft,
    MoreHorizontal,
    Paperclip,
    Send,
    Smile,
} from "lucide-react";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import { selectCurrentUser } from "@/features/auth/store/authSelector";

import {
    fetchMessages,
    sendMessage,
    setActiveConversation,
} from "../store/messagingSlice";

import {
    selectMessagesForConversation,
    selectMessagesLoading,
    selectSendingMessage,
    selectTypingUsers,
} from "../store/messagingSelectors";

import { getSocket } from "../../../services/socket";

import type {
    Conversation,
} from "../types/messaging.types";

import MessageBubble from "./Messagebubble";
import TypingIndicator from "./Typingindicator";

interface ChatWindowProps {
    conversation: Conversation;
    onBack?: () => void;
}

const TYPING_STOP_DELAY = 1500;

export default function ChatWindow({
    conversation,
    onBack,
}: ChatWindowProps) {
    const dispatch = useAppDispatch();

    const user = useAppSelector(
        selectCurrentUser,
    );

    const messages =
        useAppSelector(
            selectMessagesForConversation(
                conversation._id,
            ),
        );

    const loading =
        useAppSelector(
            selectMessagesLoading,
        );

    const sending =
        useAppSelector(
            selectSendingMessage,
        );

    const typingUserIds =
        useAppSelector(
            selectTypingUsers(
                conversation._id,
            ),
        );

    const [text, setText] =
        useState("");

    const bottomRef =
        useRef<HTMLDivElement | null>(
            null,
        );

    const inputRef =
        useRef<HTMLInputElement | null>(
            null,
        );

    const typingTimeoutRef =
        useRef<ReturnType<
            typeof setTimeout
        > | null>(null);

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

    const isSeller =
        user?.role === "seller";

    const title = isSeller
        ? buyer?.name ?? "Buyer"
        : shop?.shopName ?? "Shop";

    const otherPartyTyping =
        typingUserIds.some(
            (id) =>
                id !== user?._id,
        );

    /* ============================================================
       ROOM
    ============================================================ */

    useEffect(() => {
        dispatch(
            fetchMessages(
                conversation._id,
            ),
        );

        dispatch(
            setActiveConversation(
                conversation._id,
            ),
        );

        const socket =
            getSocket();

        socket.emit(
            "join:conversation",
            conversation._id,
        );

        return () => {
            socket.emit(
                "leave:conversation",
                conversation._id,
            );

            dispatch(
                setActiveConversation(
                    null,
                ),
            );
        };
    }, [
        dispatch,
        conversation._id,
    ]);

    /* ============================================================
       SCROLL
    ============================================================ */

    useEffect(() => {
        bottomRef.current?.scrollIntoView(
            {
                behavior: "smooth",
            },
        );
    }, [
        messages.length,
        otherPartyTyping,
    ]);

    /* ============================================================
       TYPING
    ============================================================ */

    const emitTyping = (
        typing: boolean,
    ) => {
        const socket =
            getSocket();

        socket.emit(
            typing
                ? "typing:start"
                : "typing:stop",
            conversation._id,
        );
    };

    const handleChange = (
        value: string,
    ) => {
        setText(value);

        emitTyping(true);

        if (
            typingTimeoutRef.current
        ) {
            clearTimeout(
                typingTimeoutRef.current,
            );
        }

        typingTimeoutRef.current =
            setTimeout(
                () =>
                    emitTyping(
                        false,
                    ),
                TYPING_STOP_DELAY,
            );
    };

    /* ============================================================
       SEND
    ============================================================ */

    const handleSend = async (
        e?: React.FormEvent,
    ) => {
        e?.preventDefault();

        const trimmed =
            text.trim();

        if (
            !trimmed ||
            sending
        ) {
            return;
        }

        setText("");

        emitTyping(false);

        if (
            typingTimeoutRef.current
        ) {
            clearTimeout(
                typingTimeoutRef.current,
            );
        }

        await dispatch(
            sendMessage({
                conversationId:
                    conversation._id,
                text: trimmed,
            }),
        );

        requestAnimationFrame(
            () =>
                inputRef.current?.focus(),
        );
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {
            e.preventDefault();
            void handleSend();
        }
    };

    const avatar =
        title
            .charAt(0)
            .toUpperCase();

    return (
        <div className="flex h-full min-h-0 w-full flex-col bg-surface">
            {/* ==================================================
                CHAT HEADER
            ================================================== */}

            <header className="flex shrink-0 items-center gap-3 border-b border-default bg-surface px-4 py-3 sm:px-5">
                {/* Mobile back */}
                {onBack && (
                    <button
                        type="button"
                        onClick={onBack}
                        className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            text-secondary
                            transition-colors
                            hover:bg-surface-hover
                            md:hidden
                        "
                        aria-label="Back to conversations"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                )}

                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                        {avatar}
                    </div>

                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface bg-emerald-500" />
                </div>

                {/* User */}
                <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-bold text-primary">
                        {title}
                    </h2>

                    <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                        Active conversation
                    </p>
                </div>

                {/* Actions */}
                <button
                    type="button"
                    className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        text-muted
                        transition-colors
                        hover:bg-surface-hover
                        hover:text-primary
                    "
                    aria-label="More options"
                >
                    <MoreHorizontal className="h-5 w-5" />
                </button>
            </header>

            {/* ==================================================
                MESSAGES
            ================================================== */}

            <div className="relative min-h-0 flex-1 overflow-y-auto bg-surface-muted/20">
                {/* Subtle background decoration */}
                <div className="pointer-events-none absolute inset-0 opacity-30">
                    <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-accent/5 blur-3xl" />
                </div>

                <div className="relative mx-auto w-full max-w-4xl px-3 py-5 sm:px-5 sm:py-7">
                    {/* Conversation date */}
                    {messages.length > 0 &&
                        !loading && (
                            <div className="mb-5 flex justify-center">
                                <span className="rounded-full border border-default bg-surface px-3 py-1 text-[10px] font-medium text-muted shadow-sm">
                                    Conversation
                                </span>
                            </div>
                        )}

                    {loading ? (
                        <MessageSkeleton />
                    ) : messages.length ===
                        0 ? (
                        <EmptyMessages
                            title={
                                title
                            }
                        />
                    ) : (
                        <>
                            <div className="space-y-3">
                                {messages.map(
                                    (
                                        message,
                                    ) => (
                                        <MessageBubble
                                            key={
                                                message._id
                                            }
                                            message={
                                                message
                                            }
                                            isOwn={
                                                message.sender ===
                                                user?._id
                                            }
                                        />
                                    ),
                                )}

                                {otherPartyTyping && (
                                    <div className="pt-1">
                                        <TypingIndicator />
                                    </div>
                                )}
                            </div>

                            <div
                                ref={
                                    bottomRef
                                }
                            />
                        </>
                    )}
                </div>
            </div>

            {/* ==================================================
                COMPOSER
            ================================================== */}

            <div className="shrink-0 border-t border-default bg-surface px-3 py-3 sm:px-5 sm:py-4">
                <form
                    onSubmit={
                        handleSend
                    }
                    className="mx-auto flex max-w-4xl items-end gap-2"
                >
                    {/* Attachment */}
                    <button
                        type="button"
                        className="
                            hidden
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            text-muted
                            transition-colors
                            hover:bg-surface-hover
                            hover:text-primary
                            sm:flex
                        "
                        aria-label="Attach file"
                    >
                        <Paperclip className="h-4 w-4" />
                    </button>

                    {/* Input */}
                    <div className="relative flex min-h-11 flex-1 items-center rounded-2xl border border-default bg-surface-muted/40 transition-all focus-within:border-accent focus-within:bg-surface focus-within:ring-4 focus-within:ring-accent/10">
                        <input
                            ref={
                                inputRef
                            }
                            type="text"
                            value={
                                text
                            }
                            onChange={(
                                e,
                            ) =>
                                handleChange(
                                    e
                                        .target
                                        .value,
                                )
                            }
                            onKeyDown={
                                handleKeyDown
                            }
                            placeholder="Write a message..."
                            className="
                                min-w-0
                                flex-1
                                bg-transparent
                                px-4
                                py-3
                                text-sm
                                text-primary
                                outline-none
                                placeholder:text-muted
                            "
                        />

                        <button
                            type="button"
                            className="
                                mr-1.5
                                flex
                                h-8
                                w-8
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                text-muted
                                transition-colors
                                hover:bg-surface-hover
                                hover:text-primary
                            "
                            aria-label="Add emoji"
                        >
                            <Smile className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Send */}
                    <button
                        type="submit"
                        disabled={
                            !text.trim() ||
                            sending
                        }
                        className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-2xl
                            bg-accent
                            text-accent-foreground
                            shadow-sm
                            transition-all
                            hover:-translate-y-0.5
                            hover:opacity-90
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                        aria-label="Send message"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </form>

                <p className="mx-auto mt-2 hidden max-w-4xl text-[10px] text-muted sm:block">
                    Press Enter to send
                </p>
            </div>
        </div>
    );
}

/* ================================================================
   MESSAGE SKELETON
================================================================ */

function MessageSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({
                length: 6,
            }).map((_, index) => (
                <div
                    key={index}
                    className={`flex ${index % 2
                            ? "justify-end"
                            : "justify-start"
                        }`}
                >
                    <div
                        className={`
                            h-10
                            animate-pulse
                            rounded-2xl
                            bg-surface-muted
                            ${index % 2
                                ? "w-2/5"
                                : "w-1/3"
                            }
                        `}
                    />
                </div>
            ))}
        </div>
    );
}

/* ================================================================
   EMPTY MESSAGES
================================================================ */

function EmptyMessages({
    title,
}: {
    title: string;
}) {
    return (
        <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                <Send className="h-5 w-5 text-accent" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-primary">
                Start the conversation
            </h3>

            <p className="mt-1.5 max-w-xs text-xs leading-5 text-muted">
                Send a message to{" "}
                <span className="font-semibold text-secondary">
                    {title}
                </span>{" "}
                to get the conversation started.
            </p>
        </div>
    );
}