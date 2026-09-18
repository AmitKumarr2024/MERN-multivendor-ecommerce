"use client";

import { LayoutGrid, Table2 } from "lucide-react";

export type StaffViewMode = "card" | "table";

interface ViewToggleProps {
  value: StaffViewMode;
  onChange: (mode: StaffViewMode) => void;
}

export default function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-default bg-surface p-1">
      <ToggleButton
        active={value === "card"}
        icon={<LayoutGrid className="h-3.5 w-3.5" />}
        label="Cards"
        onClick={() => onChange("card")}
      />
      <ToggleButton
        active={value === "table"}
        icon={<Table2 className="h-3.5 w-3.5" />}
        label="Table"
        onClick={() => onChange("table")}
      />
    </div>
  );
}

function ToggleButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${active
          ? "bg-accent text-accent-foreground shadow-sm"
          : "text-secondary hover:bg-surface-muted hover:text-primary"
        }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}