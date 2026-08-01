"use client";

import {
    useRef,
} from "react";

import {
    Provider,
} from "react-redux";

import {
    makeStore,
    type AppStore,
} from "@/store/store";


interface ReduxProviderProps {
    children: React.ReactNode;
}


/**
 * =========================================================
 * REDUX PROVIDER
 * =========================================================
 *
 * Purpose:
 * Makes the Redux store available to the entire application.
 *
 * Why useRef is used:
 *
 * Next.js App Router can perform server rendering before
 * hydrating the application in the browser.
 *
 * We want one stable Redux store instance for this mounted
 * provider instead of importing and sharing a global store
 * instance.
 *
 * Authentication is NOT restored from localStorage here.
 *
 * Authentication persistence is handled separately:
 *
 * HttpOnly JWT cookie
 *      ↓
 * AuthInitializer
 *      ↓
 * GET /api/auth/me
 *      ↓
 * Redux user restored
 *
 * This keeps the initial Redux authentication state
 * predictable during hydration.
 * =========================================================
 */

export default function ReduxProvider({
    children,
}: ReduxProviderProps) {

    const storeRef = useRef<AppStore | null>(
        null,
    );

    /*
     * Create the store only once for this mounted provider.
     *
     * Subsequent component renders reuse the same store.
     */
    if (storeRef.current === null) {
        storeRef.current = makeStore();
    }

    return (
        <Provider store={storeRef.current}>
            {children}
        </Provider>
    );
}