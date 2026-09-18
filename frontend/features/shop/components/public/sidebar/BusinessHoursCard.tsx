"use client";

import { useState } from "react";
import { Clock3, ChevronDown } from "lucide-react";

import type { BusinessHours, DayName } from "../../../types/shop.types";

const DAY_ORDER: DayName[] = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
];

const DAY_LABEL: Record<DayName, string> = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
};

interface BusinessHoursCardProps {
    businessHours: BusinessHours;
}

export default function BusinessHoursCard({ businessHours }: BusinessHoursCardProps) {
    const [expanded, setExpanded] = useState(false);
    const todayIndex = (new Date().getDay() + 6) % 7;
    const todayName = DAY_ORDER[todayIndex];
    const todayHours = businessHours[todayName];

    return (
        <div className="overflow-hidden rounded-3xl border border-default bg-surface shadow-sm">
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                        <Clock3 className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-primary">Business hours</p>
                        <p className="text-[11px] text-muted">
                            Today: {todayHours.isClosed ? "Closed" : `${todayHours.open} – ${todayHours.close}`}
                        </p>
                    </div>
                </div>
                <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted transition-transform ${expanded ? "rotate-180" : ""}`}
                />
            </button>

            {expanded && (
                <ul className="space-y-1.5 border-t border-default px-5 py-4 text-sm">
                    {DAY_ORDER.map((day, i) => {
                        const h = businessHours[day];
                        const isToday = i === todayIndex;

                        return (
                            <li
                                key={day}
                                className={`flex items-center justify-between rounded-lg px-2 py-1 ${isToday ? "bg-accent/5 font-bold text-primary" : "text-secondary"
                                    }`}
                            >
                                <span>{DAY_LABEL[day]}</span>
                                <span>{h.isClosed ? "Closed" : `${h.open} – ${h.close}`}</span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}