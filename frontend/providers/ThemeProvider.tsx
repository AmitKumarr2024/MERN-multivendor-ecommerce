"use client";

/**
 * =========================================================
 * THEME PROVIDER
 * =========================================================
 *
 * Purpose:
 * Provides global Light / Dark / System theme support
 * throughout the Next.js application.
 *
 * Library:
 * next-themes
 *
 * How it works:
 *
 * ThemeProvider
 *      ↓
 * next-themes
 *      ↓
 * <html class="dark">
 *      ↓
 * globals.css
 *      ↓
 * Tailwind dark:* classes become active
 *
 * Example:
 *
 * bg-white dark:bg-zinc-950
 *
 * IMPORTANT:
 * This must remain a Client Component because next-themes
 * uses browser APIs such as localStorage and the user's
 * system color-scheme preference.
 *
 * This provider should normally be mounted once inside
 * app/layout.tsx.
 * =========================================================
 */

import {
    ThemeProvider as NextThemesProvider,
} from "next-themes";

interface ThemeProviderProps {
    children: React.ReactNode;
}

export default function ThemeProvider({
    children,
}: ThemeProviderProps) {
    return (
        <NextThemesProvider

            /*
             * Apply the selected theme using a class on <html>.
             *
             * Dark:
             * <html class="dark">
             *
             * Light:
             * <html> without the dark class
             */
            attribute="class"

            /*
             * New users initially follow their operating
             * system/browser theme preference.
             */
            defaultTheme="system"

            /*
             * Allows next-themes to detect changes to the
             * user's operating system theme.
             */
            enableSystem

            /*
             * Temporarily disables CSS transitions while the
             * theme changes.
             *
             * This prevents components from flashing/animating
             * through intermediate colors during theme switching.
             */
            disableTransitionOnChange
        >
            {children}
        </NextThemesProvider>
    );
}