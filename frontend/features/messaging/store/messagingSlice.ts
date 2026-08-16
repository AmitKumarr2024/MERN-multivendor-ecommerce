import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

import api from "@/services/axios";

import type {
    Broadcast,
    Conversation,
    CreatePlatformBroadcastPayload,
    CreateShopBroadcastPayload,
    IncomingMessageEvent,
    Message,
    SendMessagePayload,
} from "../types/messaging.types";

function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        return (
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Something went wrong"
        );
    }
    if (error instanceof Error) return error.message;
    return "Something went wrong";
}

/* =========================================================
   CONVERSATIONS / MESSAGES (REST — matches conversation.routes.js)
========================================================= */

export const startOrGetConversation = createAsyncThunk<
    Conversation,
    string, // shopId
    { rejectValue: string }
>("messaging/startConversation", async (shopId, { rejectWithValue }) => {
    try {
        const { data } = await api.post<Conversation>("/messages/conversations", { shopId });
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const fetchMyConversations = createAsyncThunk<
    Conversation[],
    void,
    { rejectValue: string }
>("messaging/fetchConversations", async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get<Conversation[]>("/messages/conversations");
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const fetchMessages = createAsyncThunk<
    { conversationId: string; messages: Message[] },
    string, // conversationId
    { rejectValue: string }
>("messaging/fetchMessages", async (conversationId, { rejectWithValue }) => {
    try {
        const { data } = await api.get<Message[]>(
            `/messages/conversations/${conversationId}/messages`,
        );
        return { conversationId, messages: data };
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const sendMessage = createAsyncThunk<
    Message,
    SendMessagePayload,
    { rejectValue: string }
>("messaging/sendMessage", async ({ conversationId, text }, { rejectWithValue }) => {
    try {
        const { data } = await api.post<Message>(
            `/messages/conversations/${conversationId}/messages`,
            { text },
        );
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   BROADCASTS (REST — matches broadcast.routes.js)
========================================================= */

export const fetchShopBroadcasts = createAsyncThunk<
    Broadcast[],
    string, // shop slug
    { rejectValue: string }
>("messaging/fetchShopBroadcasts", async (slug, { rejectWithValue }) => {
    try {
        const { data } = await api.get<Broadcast[]>(`/messages/broadcasts/shop/${slug}`);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const fetchPlatformBroadcasts = createAsyncThunk<
    Broadcast[],
    void,
    { rejectValue: string }
>("messaging/fetchPlatformBroadcasts", async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get<Broadcast[]>("/messages/broadcasts/platform");
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const createShopBroadcast = createAsyncThunk<
    Broadcast,
    CreateShopBroadcastPayload,
    { rejectValue: string }
>("messaging/createShopBroadcast", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post<Broadcast>("/messages/broadcasts/shop", payload);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const createPlatformBroadcast = createAsyncThunk<
    Broadcast,
    CreatePlatformBroadcastPayload,
    { rejectValue: string }
>("messaging/createPlatformBroadcast", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post<Broadcast>("/messages/broadcasts/platform", payload);
        return data;
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

export const deactivateBroadcast = createAsyncThunk<
    { id: string; isActive: boolean },
    string,
    { rejectValue: string }
>("messaging/deactivateBroadcast", async (id, { rejectWithValue }) => {
    try {
        const { data } = await api.patch<{ _id: string; isActive: boolean }>(
            `/messages/broadcasts/${id}/deactivate`,
        );
        return { id: data._id, isActive: data.isActive };
    } catch (error) {
        return rejectWithValue(getErrorMessage(error));
    }
});

/* =========================================================
   STATE
========================================================= */

interface MessagingState {
    conversations: Conversation[];
    conversationsLoading: boolean;

    /** conversationId -> messages, so switching threads doesn't refetch. */
    messagesByConversation: Record<string, Message[]>;
    messagesLoading: boolean;
    activeConversationId: string | null;

    /** conversationId -> set of userIds currently typing. */
    typingByConversation: Record<string, string[]>;
    onlineUserIds: string[];

    shopBroadcasts: Broadcast[];
    platformBroadcasts: Broadcast[];

    sending: boolean;
    error: string | null;
}

const initialState: MessagingState = {
    conversations: [],
    conversationsLoading: false,

    messagesByConversation: {},
    messagesLoading: false,
    activeConversationId: null,

    typingByConversation: {},
    onlineUserIds: [],

    shopBroadcasts: [],
    platformBroadcasts: [],

    sending: false,
    error: null,
};

const messagingSlice = createSlice({
    name: "messaging",
    initialState,
    reducers: {
        clearMessagingError(state) {
            state.error = null;
        },
        setActiveConversation(state, action: PayloadAction<string | null>) {
            state.activeConversationId = action.payload;
        },

        /** Fed by the "message:new" socket event (see SocketProvider). */
        receiveMessage(state, action: PayloadAction<IncomingMessageEvent>) {
            const { conversationId, ...message } = action.payload;
            const list = state.messagesByConversation[conversationId] ?? [];
            // Avoid duplicating a message we already have (e.g. our own sent message).
            if (!list.some((m) => m._id === message._id)) {
                state.messagesByConversation[conversationId] = [...list, message];
            }

            const convo = state.conversations.find((c) => c._id === conversationId);
            if (convo) {
                convo.lastMessage = { text: message.text, sentBy: message.sender, sentAt: message.createdAt };
                if (state.activeConversationId !== conversationId) {
                    convo.unreadCountForBuyer += 1;
                    convo.unreadCountForSeller += 1;
                }
            }
        },

        /** Fed by "typing:start" / "typing:stop" socket events. */
        setTyping(
            state,
            action: PayloadAction<{ conversationId: string; userId: string; typing: boolean }>,
        ) {
            const { conversationId, userId, typing } = action.payload;
            const current = state.typingByConversation[conversationId] ?? [];
            state.typingByConversation[conversationId] = typing
                ? Array.from(new Set([...current, userId]))
                : current.filter((id) => id !== userId);
        },

        /** Fed by "presence:online" / "presence:offline". */
        setPresence(state, action: PayloadAction<{ userId: string; online: boolean }>) {
            const { userId, online } = action.payload;
            state.onlineUserIds = online
                ? Array.from(new Set([...state.onlineUserIds, userId]))
                : state.onlineUserIds.filter((id) => id !== userId);
        },

        /** Fed by "broadcast:shop" socket event on the currently-viewed dukan page. */
        receiveShopBroadcast(state, action: PayloadAction<Broadcast>) {
            state.shopBroadcasts.unshift(action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyConversations.pending, (state) => {
                state.conversationsLoading = true;
                state.error = null;
            })
            .addCase(fetchMyConversations.fulfilled, (state, action) => {
                state.conversationsLoading = false;
                state.conversations = action.payload;
            })
            .addCase(fetchMyConversations.rejected, (state, action) => {
                state.conversationsLoading = false;
                state.error = action.payload || "Failed to load conversations";
            });

        builder.addCase(startOrGetConversation.fulfilled, (state, action) => {
            const exists = state.conversations.some((c) => c._id === action.payload._id);
            if (!exists) state.conversations.unshift(action.payload);
        });

        builder
            .addCase(fetchMessages.pending, (state) => {
                state.messagesLoading = true;
                state.error = null;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.messagesLoading = false;
                state.messagesByConversation[action.payload.conversationId] = action.payload.messages;
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.messagesLoading = false;
                state.error = action.payload || "Failed to load messages";
            });

        builder
            .addCase(sendMessage.pending, (state) => {
                state.sending = true;
                state.error = null;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.sending = false;
                const list = state.messagesByConversation[action.payload.conversation] ?? [];
                if (!list.some((m) => m._id === action.payload._id)) {
                    state.messagesByConversation[action.payload.conversation] = [...list, action.payload];
                }
                const convo = state.conversations.find((c) => c._id === action.payload.conversation);
                if (convo) {
                    convo.lastMessage = {
                        text: action.payload.text,
                        sentBy: action.payload.sender,
                        sentAt: action.payload.createdAt,
                    };
                }
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.sending = false;
                state.error = action.payload || "Failed to send message";
            });

        builder.addCase(fetchShopBroadcasts.fulfilled, (state, action) => {
            state.shopBroadcasts = action.payload;
        });
        builder.addCase(fetchPlatformBroadcasts.fulfilled, (state, action) => {
            state.platformBroadcasts = action.payload;
        });
        builder.addCase(createShopBroadcast.fulfilled, (state, action) => {
            state.shopBroadcasts.unshift(action.payload);
        });
        builder.addCase(deactivateBroadcast.fulfilled, (state, action) => {
            state.shopBroadcasts = state.shopBroadcasts.filter((b) => b._id !== action.payload.id);
            state.platformBroadcasts = state.platformBroadcasts.filter(
                (b) => b._id !== action.payload.id,
            );
        });
    },
});

export const {
    clearMessagingError,
    setActiveConversation,
    receiveMessage,
    setTyping,
    setPresence,
    receiveShopBroadcast,
} = messagingSlice.actions;

export default messagingSlice.reducer;