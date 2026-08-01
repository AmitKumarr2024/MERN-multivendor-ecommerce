"use client";

import { useEffect, useRef, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { checkSlugAvailability } from "../store/shopSlice";
import { selectSlugCheck, selectSlugChecking } from "../store/shopSelectors";

interface SlugAvailabilityFieldProps {
    value: string;
    onChange: (value: string) => void;
    /** Exclude this slug from "taken" results — used when editing your own shop. */
    currentSlug?: string;
    label?: string;
}

export default function SlugAvailabilityField({
    value,
    onChange,
    currentSlug,
    label = "Shop URL",
}: SlugAvailabilityFieldProps) {
    const dispatch = useAppDispatch();
    const slugCheck = useAppSelector(selectSlugCheck);
    const checking = useAppSelector(selectSlugChecking);

    const [touched, setTouched] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const normalized = value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");

    useEffect(() => {
        if (!touched || !normalized) return;
        if (normalized === currentSlug) return; // unchanged, nothing to check

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            dispatch(checkSlugAvailability(normalized));
        }, 500);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [normalized, touched]);

    const showResult =
        touched && normalized.length > 0 && normalized !== currentSlug && slugCheck?.slug === normalized;

    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
            <div className="flex items-center rounded-lg border border-gray-300 shadow-sm focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900">
                <span className="pl-3 text-sm text-gray-400">/shop/</span>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        setTouched(true);
                        onChange(e.target.value);
                    }}
                    placeholder="your-shop-name"
                    className="w-full border-none bg-transparent px-1.5 py-2.5 text-sm outline-none"
                />
            </div>

            <div className="mt-1.5 min-h-4.5 text-xs">
                {checking ? (
                    <span className="text-gray-400">Checking availability...</span>
                ) : showResult ? (
                    slugCheck?.available ? (
                        <span className="flex items-center gap-1 text-green-600">
                            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                                <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm3.7 5.7-4.5 4.5-2.9-2.9 1.06-1.06L9.2 9.14l3.44-3.44 1.06 1Z" />
                            </svg>
                            /{normalized} is available
                        </span>
                    ) : (
                        <span className="text-red-600">This URL is already taken</span>
                    )
                ) : (
                    <span className="text-gray-400">Only lowercase letters, numbers, and hyphens</span>
                )}
            </div>
        </div>
    );
}