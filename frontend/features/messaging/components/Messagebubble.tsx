import type { Message } from "../types/messaging.types";

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
    const time = new Date(message.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                    isOwn
                        ? "rounded-br-sm bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "rounded-bl-sm bg-surface-muted text-primary"
                }`}
            >
                <p className="whitespace-pre-line wrap-words">{message.text}</p>
                <span
                    className={`mt-1 block text-[10px] ${
                        isOwn ? "text-white/60 dark:text-zinc-900/50" : "text-muted"
                    }`}
                >
                    {time}
                </span>
            </div>
        </div>
    );
}