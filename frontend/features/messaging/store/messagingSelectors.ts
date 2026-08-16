import type { RootState } from "@/store/store";

export const selectConversations = (state: RootState) => state.messaging.conversations;
export const selectConversationsLoading = (state: RootState) =>
    state.messaging.conversationsLoading;

export const selectActiveConversationId = (state: RootState) =>
    state.messaging.activeConversationId;

export const selectMessagesForConversation = (conversationId: string | null) => (state: RootState) =>
    conversationId ? state.messaging.messagesByConversation[conversationId] ?? [] : [];

export const selectMessagesLoading = (state: RootState) => state.messaging.messagesLoading;
export const selectSendingMessage = (state: RootState) => state.messaging.sending;

export const selectTypingUsers = (conversationId: string | null) => (state: RootState) =>
    conversationId ? state.messaging.typingByConversation[conversationId] ?? [] : [];

export const selectIsUserOnline = (userId: string | undefined) => (state: RootState) =>
    Boolean(userId && state.messaging.onlineUserIds.includes(userId));

export const selectShopBroadcasts = (state: RootState) => state.messaging.shopBroadcasts;
export const selectPlatformBroadcasts = (state: RootState) => state.messaging.platformBroadcasts;

export const selectMessagingError = (state: RootState) => state.messaging.error;

/** Total unread across all conversations for the navbar badge. */
export const selectTotalUnreadCount = (isSeller: boolean) => (state: RootState) =>
    state.messaging.conversations.reduce(
        (sum, c) => sum + (isSeller ? c.unreadCountForSeller : c.unreadCountForBuyer),
        0,
    );