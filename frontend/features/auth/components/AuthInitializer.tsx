"use client";

import {
    useEffect,
    useRef,
} from "react";

import {
    useAppDispatch,
    useAppSelector,
} from "@/store/hooks";

import {
    getMe,
} from "@/features/auth/store/authSlice";

/**
 * =========================================================
 * AUTH INITIALIZER
 * =========================================================
 *
 * Restores the authenticated user's Redux state whenever
 * the application starts or the browser is refreshed.
 *
 * Why this is required:
 *
 * JWT cookie:
 *   Persists in the browser.
 *
 * Redux:
 *   Exists only in JavaScript memory and is reset whenever
 *   the page is refreshed.
 *
 * Refresh flow:
 *
 * Browser refresh
 *      ↓
 * Redux recreated
 *      ↓
 * user = null
 * initialized = false
 *      ↓
 * AuthInitializer mounts
 *      ↓
 * GET /api/auth/me
 *      ↓
 * Browser sends JWT cookie automatically
 *      ↓
 * Backend verifies JWT
 *      ↓
 * Current user returned
 *      ↓
 * Redux user restored
 *
 * This component renders no UI.
 * =========================================================
 */

export default function AuthInitializer() {
    const dispatch = useAppDispatch();

    const initialized = useAppSelector(
        (state) => state.auth.initialized,
    );

    const startedRef = useRef(false);

    useEffect(() => {
        if (
            initialized ||
            startedRef.current
        ) {
            return;
        }

        startedRef.current = true;

        dispatch(getMe());
    }, [
        dispatch,
        initialized,
    ]);

    return null;
}