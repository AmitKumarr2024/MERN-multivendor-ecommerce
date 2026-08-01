"use client";

import type { ReactNode } from "react";
import BuyerSidebar from "@/features/buyer/components/BuyerSidebar";

interface BuyerLayoutProps {
    children: ReactNode;
}

export default function BuyerLayout({ children }: BuyerLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
                {/* Desktop Buyer Sidebar */}
                <aside className="hidden w-64 shrink-0 lg:block">
                    <BuyerSidebar />
                </aside>

                {/* Buyer Page Content */}
                <main className="min-w-0 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}