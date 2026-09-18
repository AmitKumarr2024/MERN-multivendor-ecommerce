"use client";

import { MessageCircle, Search } from "lucide-react";
import { useState } from "react";

import type { Conversation } from "../types/messaging.types";
import ConversationList from "./Conversationlist";
import ChatWindow from "./Chatwindow";

export default function MessagesPage() {
    const [selected, setSelected] =
        useState<Conversation | null>(null);

    return (
        <main className="min-h-[calc(100vh-4rem)] bg-surface-muted/30">
            <div className="mx-auto max-w-[1500px] px-3 py-3 sm:px-5 sm:py-5 lg:px-6">
                {/* ==================================================
                    PAGE HEADER
                ================================================== */}

                <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                                <MessageCircle className="h-4 w-4 text-accent" />
                            </div>

                            <h1 className="text-xl font-bold tracking-tight text-primary sm:text-2xl">
                                Messages
                            </h1>
                        </div>

                        <p className="mt-1 hidden text-sm text-secondary sm:block">
                            Chat with buyers and sellers in real time.
                        </p>
                    </div>
                </div>

                {/* ==================================================
                    CHAT WORKSPACE
                ================================================== */}

                <section
                    className="
                        overflow-hidden
                        rounded-2xl
                        border border-default
                        bg-surface
                        shadow-sm
                        lg:rounded-3xl
                    "
                >
                    <div
                        className="
                            grid
                            h-[calc(100vh-9rem)]
                            min-h-[520px]
                            max-h-[850px]
                            md:grid-cols-[320px_minmax(0,1fr)]
                            lg:grid-cols-[350px_minmax(0,1fr)]
                            xl:grid-cols-[380px_minmax(0,1fr)]
                        "
                    >
                        {/* ==================================================
                            CONVERSATIONS
                        ================================================== */}

                        <aside
                            className={`
                                min-w-0
                                overflow-hidden
                                border-default
                                md:border-r
                                ${selected
                                    ? "hidden md:flex md:flex-col"
                                    : "flex flex-col"
                                }
                            `}
                        >
                            <ConversationList
                                activeId={
                                    selected?._id ??
                                    null
                                }
                                onSelect={
                                    setSelected
                                }
                            />
                        </aside>

                        {/* ==================================================
                            CHAT
                        ================================================== */}

                        <section
                            className={`
                                min-w-0
                                overflow-hidden
                                ${selected
                                    ? "flex"
                                    : "hidden md:flex"
                                }
                            `}
                        >
                            {selected ? (
                                <ChatWindow
                                    conversation={
                                        selected
                                    }
                                    onBack={() =>
                                        setSelected(
                                            null,
                                        )
                                    }
                                />
                            ) : (
                                <EmptyChatState />
                            )}
                        </section>
                    </div>
                </section>
            </div>
        </main>
    );
}

/* ================================================================
   EMPTY CHAT STATE
================================================================ */

function EmptyChatState() {
    return (
        <div className="flex h-full w-full items-center justify-center bg-surface-muted/20 px-6">
            <div className="max-w-sm text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-muted">
                    <MessageCircle className="h-7 w-7 text-muted" />
                </div>

                <h2 className="mt-5 text-base font-semibold text-primary">
                    Your messages
                </h2>

                <p className="mt-2 text-sm leading-6 text-secondary">
                    Select a conversation from your inbox
                    to start chatting.
                </p>

                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Real-time messaging
                </div>
            </div>
        </div>
    );
}