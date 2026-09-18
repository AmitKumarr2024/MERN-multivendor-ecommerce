"use client";

import { LayoutGrid, List } from "lucide-react";

export type KhataViewMode = "cards" | "table";

export default function KhataViewToggle({
    mode,
    onChange,
}: {
    mode: KhataViewMode;
    onChange: (mode: KhataViewMode) => void;
}) {
    return (
        <div className="inline-flex items-center gap-1 rounded-xl border border-default bg-surface p-1">
            <button
                type="button"
                onClick={() => onChange("cards")}
                aria-pressed={mode === "cards"}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${mode === "cards"
                        ? "bg-accent text-accent-foreground"
                        : "text-secondary hover:bg-surface-hover"
                    }`}
            >
                <LayoutGrid className="h-3.5 w-3.5" />
                Cards
            </button>
            <button
                type="button"
                onClick={() => onChange("table")}
                aria-pressed={mode === "table"}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${mode === "table"
                        ? "bg-accent text-accent-foreground"
                        : "text-secondary hover:bg-surface-hover"
                    }`}
            >
                <List className="h-3.5 w-3.5" />
                Table
            </button>
        </div>
    );
}