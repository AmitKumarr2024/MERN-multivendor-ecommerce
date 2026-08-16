"use client";

import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/features/auth/store/authSelector";
import { startOrGetConversation } from "../store/messagingSlice";

interface StartChatButtonProps {
    shopId: string;
    className?: string;
}

/**
 * Usage on the public shop page:
 *
 *   <StartChatButton shopId={shop._id} />
 *
 * Creates (or reuses) the buyer<->shop conversation, then sends the
 * buyer to /buyer/messages where MessagesPage picks it up.
 */
export default function StartChatButton({ shopId, className }: StartChatButtonProps) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    const handleClick = async () => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        const result = await dispatch(startOrGetConversation(shopId));
        if (startOrGetConversation.fulfilled.match(result)) {
            router.push("/buyer/messages");
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`inline-flex my-4 items-center gap-1.5 rounded-lg border border-default px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-surface-hover ${className ?? ""}`}
        >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path
                    fillRule="evenodd"
                    d="M2 10c0-3.9 3.6-7 8-7s8 3.1 8 7-3.6 7-8 7a9 9 0 0 1-2.5-.35L3 18l1.1-3.3A6.6 6.6 0 0 1 2 10Z"
                    clipRule="evenodd"
                />
            </svg>
            Message seller
        </button>
    );
}