"use client";

import type {
    ReactNode,
} from "react";

export interface TabItem {
    value: string;
    label: string;
    content: ReactNode;
}

interface TabsProps {
    tabs: TabItem[];
    value: string;
    onChange: (value: string) => void;
}

export default function Tabs({
    tabs,
    value,
    onChange,
}: TabsProps) {
    const activeTab =
        tabs.find(
            (tab) => tab.value === value,
        ) ?? tabs[0];

    return (
        <div className="w-full">
            <div
                role="tablist"
                className="flex gap-1 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800"
            >
                {tabs.map((tab) => {
                    const active =
                        tab.value === value;

                    return (
                        <button
                            key={tab.value}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() =>
                                onChange(tab.value)
                            }
                            className={`
                                whitespace-nowrap border-b-2
                                px-4 py-3 text-sm font-semibold
                                transition
                                ${active
                                    ? "border-zinc-950 text-zinc-950 dark:border-white dark:text-white"
                                    : "border-transparent text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {activeTab && (
                <div
                    role="tabpanel"
                    className="pt-5"
                >
                    {activeTab.content}
                </div>
            )}
        </div>
    );
}