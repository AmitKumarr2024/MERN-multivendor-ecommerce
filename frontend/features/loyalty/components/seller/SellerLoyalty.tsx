"use client";

import { useState } from "react";
import LoyaltyProgramForm from "./LoyaltyProgramForm";
import LoyaltyCustomers from "./LoyaltyCustomers";
import LoyaltyRedemptions from "./LoyaltyRedemptions";

const TABS = [["program", "Program"], ["customers", "Customers"], ["rewards", "Redeemed rewards"]] as const;

export default function SellerLoyalty({ shopId }: { shopId: string }) {
    const [tab, setTab] = useState<(typeof TABS)[number][0]>("program");
    return (
        <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto">
                {TABS.map(([k, l]) => (
                    <button key={k} onClick={() => setTab(k)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold ${tab === k ? "bg-accent text-accent-foreground" : "bg-surface-muted text-secondary hover:bg-surface-hover"}`}>{l}</button>
                ))}
            </div>
            {tab === "program" && <LoyaltyProgramForm shopId={shopId} />}
            {tab === "customers" && <LoyaltyCustomers shopId={shopId} />}
            {tab === "rewards" && <LoyaltyRedemptions shopId={shopId} />}
        </div>
    );
}