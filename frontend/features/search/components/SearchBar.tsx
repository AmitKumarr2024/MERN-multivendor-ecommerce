"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import api from "@/services/axios";
import type { SearchSuggestionProduct, SearchSuggestionCategory } from "../types/search.types";

interface SearchBarProps {
    /** Applies the compact mobile-bar styling instead of the desktop pill. */
    variant?: "desktop" | "mobile";
    onNavigate?: () => void; // used to close the mobile menu after a search
}

function formatPrice(value: number): string {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
}

export default function SearchBar({ variant = "desktop", onNavigate }: SearchBarProps) {
    const router = useRouter();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [query, setQuery] = useState("");
    const [products, setProducts] = useState<SearchSuggestionProduct[]>([]);
    const [categories, setCategories] = useState<SearchSuggestionCategory[]>([]);
    const [trending, setTrending] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    // Trending terms fetched once, shown when the box is focused but empty
    useEffect(() => {
        api
            .get("/products/search/trending")
            .then(({ data }) => setTrending(data.trending))
            .catch(() => { });
    }, []);

    // Debounced autocomplete - waits 250ms after typing stops
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (query.trim().length < 2) {
            setProducts([]);
            setCategories([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                const { data } = await api.get("/products/search/suggestions", {
                    params: { q: query },
                });
                setProducts(data.products);
                setCategories(data.categories);
                setActiveIndex(-1);
            } catch {
                // silent fail - autocomplete is a nice-to-have, not critical
            }
        }, 250);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const goToSearch = (term: string) => {
        const q = term.trim();
        if (!q) return;
        setOpen(false);
        onNavigate?.();
        router.push(`/search?q=${encodeURIComponent(q)}`);
    };

    const goToProduct = (id: string) => {
        setOpen(false);
        onNavigate?.();
        router.push(`/products/${id}`);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        goToSearch(query);
    };

    // Keyboard navigation through the dropdown list, matching the flat
    // rendered order: categories first, then products
    const flatItems = [
        ...categories.map((c) => ({ type: "category" as const, data: c })),
        ...products.map((p) => ({ type: "product" as const, data: p })),
    ];

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!open || flatItems.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, -1));
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            const item = flatItems[activeIndex];
            if (item.type === "category") {
                setOpen(false);
                onNavigate?.();
                router.push(`/products?category=${item.data.slug}`);
            } else {
                goToProduct(item.data._id);
            }
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    const showDropdown =
        open && (query.length >= 2 ? products.length > 0 || categories.length > 0 : trending.length > 0);

    const inputClass =
        variant === "desktop"
            ? "h-10 w-full rounded-lg border border-strong bg-surface-muted pl-9 pr-3 text-sm text-primary outline-none focus:border-accent focus:bg-surface"
            : "h-10 w-full rounded-lg border border-strong bg-surface-muted pl-9 pr-3 text-sm text-primary outline-none focus:border-accent focus:bg-surface";

    return (
        <div ref={wrapperRef} className="relative w-full">
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                    >
                        <path
                            fillRule="evenodd"
                            d="M9 3.5a5.5 5.5 0 1 0 3.61 9.65l3.62 3.62a.75.75 0 1 0 1.06-1.06l-3.62-3.62A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setOpen(true)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search products..."
                        className={inputClass}
                        autoComplete="off"
                    />
                </div>
            </form>

            {showDropdown && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-lg border border-default bg-surface shadow-lg">
                    {query.length < 2 && trending.length > 0 && (
                        <div className="p-3">
                            <p className="mb-2 px-1 text-xs font-medium text-muted">Trending searches</p>
                            <div className="flex flex-wrap gap-2">
                                {trending.map((term) => (
                                    <button
                                        key={term}
                                        type="button"
                                        onClick={() => goToSearch(term)}
                                        className="rounded-full border border-default px-3 py-1 text-xs text-secondary hover:bg-surface-hover"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {categories.length > 0 && (
                        <div className="border-b border-default p-2">
                            {categories.map((cat, i) => (
                                <Link
                                    key={cat._id}
                                    href={`/products?category=${cat.slug}`}
                                    onClick={() => {
                                        setOpen(false);
                                        onNavigate?.();
                                    }}
                                    className={`block rounded-lg px-3 py-2 text-sm text-secondary hover:bg-surface-hover ${activeIndex === i ? "bg-surface-hover" : ""
                                        }`}
                                >
                                    In <span className="font-medium text-primary">{cat.name}</span>
                                </Link>
                            ))}
                        </div>
                    )}

                    {products.map((p, i) => {
                        const idx = categories.length + i;
                        return (
                            <button
                                key={p._id}
                                type="button"
                                onClick={() => goToProduct(p._id)}
                                className={`flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface-hover ${activeIndex === idx ? "bg-surface-hover" : ""
                                    }`}
                            >
                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                                    {p.images?.[0] && (
                                        <Image
                                            src={p.images[0]}
                                            alt=""
                                            fill
                                            sizes="40px"
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm text-primary">{p.name}</p>
                                    <p className="text-xs text-muted">
                                        {formatPrice(p.discountPrice ?? p.price)}
                                    </p>
                                </div>
                            </button>
                        );
                    })}

                    {query.length >= 2 && (
                        <button
                            type="button"
                            onClick={() => goToSearch(query)}
                            className="block w-full border-t border-default px-3 py-2.5 text-left text-sm font-medium text-blue-500 hover:bg-surface-hover"
                        >
                            See all results for &quot;{query}&quot;
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}