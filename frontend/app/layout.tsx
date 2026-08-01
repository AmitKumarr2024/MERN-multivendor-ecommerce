import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import ReduxProvider from "@/providers/ReduxProvider";
import ThemeProvider from "@/providers/ThemeProvider";

import "./globals.css";
import AuthInitializer from "@/features/auth/components/AuthInitializer";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";


/* =========================================================
   APPLICATION FONTS

   Next.js automatically optimizes and loads Geist fonts.

   These CSS variables are also used inside globals.css:
   --font-geist-sans
   --font-geist-mono
========================================================= */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


/* =========================================================
   GLOBAL METADATA

   Default SEO metadata for the entire application.

   Individual pages can override the title/description
   by exporting their own metadata.
========================================================= */

export const metadata: Metadata = {
  title: {
    default: "Your Store Name",
    template: "%s | Your Store Name",
  },

  description:
    "Shop products from trusted sellers across multiple categories.",
};


/* =========================================================
   ROOT LAYOUT PROPS
========================================================= */

interface RootLayoutProps {
  children: React.ReactNode;
}


/* =========================================================
   ROOT APPLICATION LAYOUT

   This is the top-level layout for the entire application.

   Provider hierarchy:

   RootLayout
       ↓
   ThemeProvider
       ↓
   ReduxProvider
       ↓
   Application

   ThemeProvider:
   - Light theme
   - Dark theme
   - System theme

   ReduxProvider:
   - Authentication state
   - Cart state
   - Wishlist state
   - Other global Redux state

   Sonner Toaster:
   - Success notifications
   - Error notifications
   - Info notifications
   - Warning notifications
========================================================= */

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="bg-background text-foreground antialiased">

        {/* =====================================================
            THEME PROVIDER

            Controls:
            - Light theme
            - Dark theme
            - System theme

            next-themes may dynamically add:
            <html class="dark">

            suppressHydrationWarning on <html> prevents the
            expected hydration warning from this behavior.
        ===================================================== */}
        <ThemeProvider>

          {/* ===================================================
              REDUX PROVIDER

              Makes the Redux store available throughout
              Client Components in the application.
          =================================================== */}
          <ReduxProvider>
            <Navbar />
            <AuthInitializer />
            {children}

            {/* ===============================================
                GLOBAL TOAST NOTIFICATIONS

                Sonner provides application-wide notifications.

                Any Client Component can now use:

                toast.success("Account created successfully");
                toast.error("Something went wrong");
                toast.info("Information");
                toast.warning("Warning");

                Placing Toaster here means individual pages
                do NOT need their own <Toaster />.
            =============================================== */}
            <Footer />
            <Toaster
              position="top-right"
              richColors
              closeButton
            />

          </ReduxProvider>

        </ThemeProvider>

      </body>
    </html>
  );
}