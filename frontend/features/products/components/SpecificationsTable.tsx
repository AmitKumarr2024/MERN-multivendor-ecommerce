"use client";

import { useState } from "react";
import type { ProductSpecification } from "../types/product.types";
import { ChevronDown } from "lucide-react";

export default function SpecificationsTable({
    specs,
}: {
    specs: ProductSpecification[];
}) {
    const [isOpen, setIsOpen] = useState(false);

    if (!specs || specs.length === 0) return null;

    return (
        <section className="w-full border-y border-default">
            {/* Accordion Header */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                className="
                    group flex w-full items-center
                    justify-between gap-4
                    py-4 text-left
                    transition-colors
                "
            >
                <div className="flex min-w-0 items-center gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-semibold text-primary sm:text-base">
                                Specifications
                            </h2>

                            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-muted">
                                {specs.length}
                            </span>
                        </div>

                        <p className="mt-0.5 text-xs text-muted">
                            Product details and features
                        </p>
                    </div>
                </div>

                <span
                    className="
                        flex h-8 w-8 shrink-0 items-center
                        justify-center rounded-full
                        bg-surface-muted
                        text-secondary
                        transition-colors
                        group-hover:bg-surface-hover
                    "
                >
                    <ChevronDown
                        className={`
                            h-4 w-4
                            transition-transform
                            duration-300
                            ${isOpen ? "rotate-180" : ""}
                        `}
                    />
                </span>
            </button>

            {/* Content */}
            <div
                className={`
                    grid transition-[grid-template-rows,opacity]
                    duration-300 ease-in-out
                    ${isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }
                `}
            >
                <div className="overflow-hidden">
                    <dl className="mb-4 overflow-hidden rounded-xl border border-default">
                        {specs.map((spec, index) => (
                            <div
                                key={`${spec.label}-${index}`}
                                className={`
                                    grid grid-cols-1 gap-1
                                    px-4 py-3.5
                                    sm:grid-cols-[minmax(110px,0.7fr)_1fr]
                                    sm:gap-6
                                    ${index !== specs.length - 1
                                        ? "border-b border-default"
                                        : ""
                                    }
                                    transition-colors
                                    hover:bg-surface-hover
                                `}
                            >
                                <dt className="text-xs font-medium text-muted">
                                    {spec.label}
                                </dt>

                                <dd className="break-words text-sm font-medium leading-5 text-primary sm:text-right">
                                    {spec.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </section>
    );
}