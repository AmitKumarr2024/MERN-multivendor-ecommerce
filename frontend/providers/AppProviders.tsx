"use client";

import { useEffect } from "react";
import ThemeProvider from "./ThemeProvider";
import ReduxProvider from "./ReduxProvider";
import AuthInitializer from "@/features/auth/components/AuthInitializer";
import SocketProvider from "./SocketProvider";

interface AppProviderProps {
    children: React.ReactNode;
}

/**
 * =========================================================
 * APP PROVIDER
 * =========================================================
 *
 * Composes every app-wide provider in the ONE order that
 * actually works, so `app/layout.tsx` doesn't need to know
 * or remember why the order matters:
 *
 *   ThemeProvider        - no dependency on anything else
 *        ↓
 *   ReduxProvider          - store must exist before anything
 *        ↓                  below can call useAppSelector/useAppDispatch
 *   AuthInitializer         - resolves isAuthenticated BEFORE
 *        ↓                  SocketProvider decides whether to connect
 *   SocketProvider          - reads isAuthenticated from Redux
 *        ↓
 *   {children}              - Navbar, page content, Footer, Toaster
 *                             all live inside app/layout.tsx, wrapped
 *                             by this single <AppProvider>
 *
 * Adding a new app-wide provider later (e.g. a CartHydrator or
 * NotificationProvider) means editing ONLY this file, in the
 * right slot — layout.tsx never needs to change.
 *
 * Also listens for the `ratelimit:exceeded` CustomEvent dispatched by
 * services/axios.ts whenever the backend returns a 429. Kept here
 * (not inside axios.ts) so the actual toast/UI call stays swappable
 * without touching the axios layer. TODO: replace console.warn below
 * with the real toast call once the project's toast library is
 * confirmed.
 * =========================================================
 */
export default function AppProvider({ children }: AppProviderProps) {
    useEffect(() => {
        const handleRateLimit = (e: Event) => {
            const { message, retryAfterSeconds } = (e as CustomEvent).detail;
            // TODO: swap for real toast call, e.g. toast.error(message)
            console.warn(
                retryAfterSeconds
                    ? `${message} (retry in ~${retryAfterSeconds}s)`
                    : message
            );
        };

        window.addEventListener("ratelimit:exceeded", handleRateLimit);
        return () =>
            window.removeEventListener("ratelimit:exceeded", handleRateLimit);
    }, []);

    return (
        <ThemeProvider>
            <ReduxProvider>
                <AuthInitializer />
                <SocketProvider>{children}</SocketProvider>
            </ReduxProvider>
        </ThemeProvider>
    );
}