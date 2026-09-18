"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { Khata } from "../../types/khata.types";
import KhataStatusBadge from "../shared/KhataStatusBadge";

const PAGE_SIZE = 10;

export default function KhataTableView({
    khatas,
    onSelect,
    onApprove,
    onReject,
}: {
    khatas: Khata[];
    onSelect: (id: string) => void;
    onApprove: (k: Khata) => void;
    onReject: (k: Khata) => void;
}) {
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(khatas.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageItems = khatas.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    return (
        <div className="space-y-3">
            <div className="overflow-x-auto rounded-2xl border border-default">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-default bg-surface-muted/50 text-left text-xs font-semibold text-muted">
                            <th className="px-4 py-3">Buyer</th>
                            <th className="hidden px-4 py-3 sm:table-cell">Status</th>
                            <th className="hidden px-4 py-3 md:table-cell">Credit Limit</th>
                            <th className="hidden px-4 py-3 md:table-cell">Outstanding</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-default">
                        {pageItems.map((k) => {
                            const buyer = typeof k.buyer === "string" ? null : k.buyer;
                            const initial = (buyer?.name ?? "B").charAt(0).toUpperCase();

                            return (
                                <tr
                                    key={k._id}
                                    onClick={() => onSelect(k._id)}
                                    className="cursor-pointer bg-surface transition-colors hover:bg-surface-hover"
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-accent to-purple-500 text-xs font-bold text-accent-foreground">
                                                {initial}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-primary">
                                                    {buyer?.name ?? "Buyer"}
                                                </p>
                                                <p className="truncate text-xs text-muted sm:hidden">
                                                    {buyer?.email}
                                                </p>
                                                <div className="mt-0.5 sm:hidden">
                                                    <KhataStatusBadge status={k.status} />
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="hidden px-4 py-3 sm:table-cell">
                                        <KhataStatusBadge status={k.status} />
                                    </td>
                                    <td className="hidden px-4 py-3 text-primary md:table-cell">
                                        {k.status === "pending" || k.status === "rejected"
                                            ? "—"
                                            : `₹${k.creditLimit.toLocaleString("en-IN")}`}
                                    </td>
                                    <td className="hidden px-4 py-3 text-primary md:table-cell">
                                        {k.status === "pending" || k.status === "rejected"
                                            ? "—"
                                            : `₹${k.outstandingBalance.toLocaleString("en-IN")}`}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {k.status === "pending" ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onApprove(k);
                                                    }}
                                                    className="rounded-lg bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground hover:opacity-90"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onReject(k);
                                                    }}
                                                    className="rounded-lg border border-default px-2.5 py-1 text-xs font-semibold text-secondary hover:bg-surface-hover"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-medium text-accent">View →</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ===================== PAGINATION ===================== */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between gap-2 text-xs text-muted">
                    <span>
                        Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, khatas.length)} of{" "}
                        {khatas.length}
                    </span>
                    <div className="flex items-center gap-1">
                        <PageButton onClick={() => setPage(1)} disabled={safePage === 1}>
                            <ChevronsLeft className="h-3.5 w-3.5" />
                        </PageButton>
                        <PageButton onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </PageButton>
                        <span className="px-2 font-medium text-primary">
                            {safePage} / {totalPages}
                        </span>
                        <PageButton
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages}
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </PageButton>
                        <PageButton onClick={() => setPage(totalPages)} disabled={safePage === totalPages}>
                            <ChevronsRight className="h-3.5 w-3.5" />
                        </PageButton>
                    </div>
                </div>
            )}
        </div>
    );
}

function PageButton({
    children,
    onClick,
    disabled,
}: {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-default text-secondary transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
            {children}
        </button>
    );
}