"use client";

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
 * =========================================================
 */
export default function AppProvider({ children }: AppProviderProps) {
    return (
        <ThemeProvider>
            <ReduxProvider>
                <AuthInitializer />
                <SocketProvider>{children}</SocketProvider>
            </ReduxProvider>
        </ThemeProvider>
    );
}