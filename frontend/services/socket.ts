import { io, type Socket } from "socket.io-client";

/**
 * Single shared socket instance for the whole app.
 *
 * Backend (sockets/index.js) authenticates via the same httpOnly JWT
 * cookie used by REST calls — so this just needs `withCredentials: true`,
 * no token is passed manually.
 *
 * Connects lazily (only when getSocket() is first called, typically from
 * SocketProvider on mount) so it never tries to connect during SSR.
 */

let socket: Socket | null = null;

const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL ??
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ??
    "http://localhost:3008";

export function getSocket(): Socket {
    if (!socket) {
        socket = io(SOCKET_URL, {
            withCredentials: true,
            autoConnect: false,
            transports: ["websocket", "polling"],
        });
    }
    return socket;
}

export function connectSocket(): Socket {
    const s = getSocket();
    if (!s.connected) s.connect();
    return s;
}

export function disconnectSocket(): void {
    socket?.disconnect();
}