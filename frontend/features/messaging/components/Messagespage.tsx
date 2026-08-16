"use client";

import { useState } from "react";

import type { Conversation } from "../types/messaging.types";
import ConversationList from "./Conversationlist";
import ChatWindow from "./Chatwindow";

export default function MessagesPage() {
    const [selected, setSelected] = useState<Conversation | null>(null);

    return (
        <div className="mx-auto max-w-6xl p-4 sm:p-6">
            <h1 className="mb-4 text-xl font-semibold text-primary sm:text-2xl">Messages</h1>

            <div className="grid h-[70vh] overflow-hidden rounded-2xl border border-default bg-surface shadow-sm md:grid-cols-[320px_1fr]">
                {/* Inbox — hidden on mobile once a chat is open */}
                <div className={`overflow-y-auto border-default md:border-r ${selected ? "hidden md:block" : "block"}`}>
                    <ConversationList activeId={selected?._id ?? null} onSelect={setSelected} />
                </div>

                {/* Chat — shown full width on mobile once a conversation is picked */}
                <div className={`${selected ? "block" : "hidden md:flex"} md:items-center md:justify-center`}>
                    {selected ? (
                        <ChatWindow conversation={selected} onBack={() => setSelected(null)} />
                    ) : (
                        <p className="text-sm text-muted">Select a conversation to start chatting.</p>
                    )}
                </div>
            </div>
        </div>
    );
}