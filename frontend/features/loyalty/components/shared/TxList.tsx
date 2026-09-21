"use client";

import type { LoyaltyTransaction } from "../../types/loyalty.types";

const LABEL: Record<LoyaltyTransaction["type"], string> = { earn: "Points earned", redeem: "Reward redeemed", reversal: "Reversed", expire: "Expired", adjust: "Adjustment" };

export default function TxList({ items }: { items: LoyaltyTransaction[] }) {
    if (items.length === 0) return <p className="rounded-xl border border-dashed border-default py-8 text-center text-sm text-muted">No points activity yet.</p>;
    return (
        <div className="divide-y divide-default overflow-hidden rounded-xl border border-default">
            {items.map((t) => (
                <div key={t._id} className="flex items-center justify-between gap-3 p-3.5">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-primary">{LABEL[t.type]}</p>
                        <p className="truncate text-xs text-muted">
                            {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            {t.note ? ` · ${t.note}` : ""}
                            {t.expiresAt ? ` · expires ${new Date(t.expiresAt).toLocaleDateString("en-IN")}` : ""}
                        </p>
                    </div>
                    <div className="shrink-0 text-right">
                        <p className={`text-sm font-bold ${t.points >= 0 ? "text-success-text" : "text-danger-text"}`}>{t.points > 0 ? "+" : ""}{t.points}</p>
                        <p className="text-[11px] text-muted">Bal {t.balanceAfter}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}