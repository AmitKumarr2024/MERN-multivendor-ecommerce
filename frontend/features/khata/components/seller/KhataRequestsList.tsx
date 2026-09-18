"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Users, Wallet, Inbox, ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchShopKhataRequests } from "../../store/khataSlice";
import { selectShopKhatas } from "../../store/khataSelectors";
import type { Khata, KhataStatus } from "../../types/khata.types";
import KhataStatusBadge from "../shared/KhataStatusBadge";
import KhataApproveModal from "./KhataApproveModal";
import KhataRejectModal from "./KhataRejectModal";
import KhataDetailPanel from "./KhataDetailPanel";
import KhataViewToggle, { type KhataViewMode } from "./KhataViewToggle";
import KhataTableView from "./KhataTableView";

const TABS: { label: string; value: KhataStatus | "all" }[] = [
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
    { label: "Suspended", value: "suspended" },
    { label: "All", value: "all" },
];

const VIEW_MODE_KEY = "khata-list-view-mode";

export default function KhataRequestsList({ shopId }: { shopId: string }) {
    const dispatch = useAppDispatch();
    const khatas = useAppSelector(selectShopKhatas);
    const [tab, setTab] = useState<KhataStatus | "all">("pending");
    const [query, setQuery] = useState("");
    const [viewMode, setViewMode] = useState<KhataViewMode>("cards");
    const [approveTarget, setApproveTarget] = useState<Khata | null>(null);
    const [rejectTarget, setRejectTarget] = useState<Khata | null>(null);
    const [detailTargetId, setDetailTargetId] = useState<string | null>(null);

    // Restore the buyer's preferred view (cards vs table), same pattern as
    // the Staff module — 1000+ buyers on a shop makes table + pagination
    // essential, so this preference matters and should persist.
    useEffect(() => {
        const saved = localStorage.getItem(VIEW_MODE_KEY);
        if (saved === "cards" || saved === "table") setViewMode(saved);
    }, []);

    const handleViewModeChange = (mode: KhataViewMode) => {
        setViewMode(mode);
        localStorage.setItem(VIEW_MODE_KEY, mode);
    };

    useEffect(() => {
        dispatch(fetchShopKhataRequests({ shopId, status: tab === "all" ? undefined : tab }));
    }, [dispatch, shopId, tab]);

    const filtered = useMemo(() => {
        if (!query.trim()) return khatas;
        const q = query.trim().toLowerCase();
        return khatas.filter((k) => {
            const buyer = typeof k.buyer === "string" ? null : k.buyer;
            return (
                buyer?.name?.toLowerCase().includes(q) ||
                buyer?.email?.toLowerCase().includes(q) ||
                buyer?.phone?.toLowerCase().includes(q)
            );
        });
    }, [khatas, query]);

    const totalOutstanding = useMemo(
        () => khatas.reduce((sum, k) => sum + (k.status === "approved" ? k.outstandingBalance : 0), 0),
        [khatas],
    );

    // Always read the live khata object from the store by id, so that
    // actions performed inside the detail panel (suspend, payment, limit
    // update) reflect immediately without needing to re-open the panel.
    const detailTarget = detailTargetId
        ? khatas.find((k) => k._id === detailTargetId) ?? null
        : null;

    // ==================================================
    // DETAIL VIEW — same tab, replaces the list inline
    // ==================================================
    if (detailTarget) {
        return (
            <div className="space-y-4">
                <button
                    type="button"
                    onClick={() => setDetailTargetId(null)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-secondary transition-colors hover:text-primary"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Khata list
                </button>

                <div className="rounded-2xl border border-default bg-surface p-4 sm:p-6">
                    <KhataDetailPanel khata={detailTarget} />
                </div>
            </div>
        );
    }

    // ==================================================
    // LIST VIEW
    // ==================================================
    return (
        <div className="space-y-5">
            {/* ===================== SUMMARY STRIP ===================== */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl border border-default bg-surface p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                        <Users className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-lg font-bold leading-none text-primary">{khatas.length}</p>
                        <p className="mt-1 truncate text-xs text-muted">
                            {tab === "all" ? "Total buyers" : `${TABS.find((t) => t.value === tab)?.label} buyers`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-default bg-surface p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-bg text-warning-text">
                        <Wallet className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-lg font-bold leading-none text-primary">
                            ₹{totalOutstanding.toLocaleString("en-IN")}
                        </p>
                        <p className="mt-1 text-xs text-muted">Outstanding (approved)</p>
                    </div>
                </div>
            </div>

            {/* ===================== TABS + SEARCH + VIEW TOGGLE ===================== */}
            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                        {TABS.map((t) => (
                            <button
                                key={t.value}
                                onClick={() => setTab(t.value)}
                                className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${tab === t.value
                                    ? "bg-accent text-accent-foreground"
                                    : "bg-surface-muted text-secondary hover:bg-surface-hover"
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <KhataViewToggle mode={viewMode} onChange={handleViewModeChange} />
                </div>

                <div className="relative sm:w-80">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search buyer name, email, phone"
                        className="w-full rounded-xl border border-default bg-surface py-2 pl-9 pr-3 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10"
                    />
                </div>
            </div>

            {/* ===================== EMPTY STATE ===================== */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-default bg-surface py-14 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-muted text-muted">
                        <Inbox className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-primary">
                        {query.trim() ? "No matching buyers" : "No requests in this category"}
                    </p>
                    <p className="mt-1 max-w-xs text-xs text-muted">
                        {query.trim()
                            ? "Try a different name, email, or phone number."
                            : "Buyer Khata requests will show up here."}
                    </p>
                </div>
            ) : viewMode === "table" ? (
                /* ===================== TABLE VIEW ===================== */
                <KhataTableView
                    khatas={filtered}
                    onSelect={setDetailTargetId}
                    onApprove={setApproveTarget}
                    onReject={setRejectTarget}
                />
            ) : (
                /* ===================== CARD VIEW ===================== */
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((k) => {
                        const buyer = typeof k.buyer === "string" ? null : k.buyer;
                        const initial = (buyer?.name ?? "B").charAt(0).toUpperCase();
                        const usagePct =
                            k.status === "approved" && k.creditLimit > 0
                                ? Math.min(100, Math.round((k.outstandingBalance / k.creditLimit) * 100))
                                : 0;

                        return (
                            <div
                                key={k._id}
                                role="button"
                                tabIndex={0}
                                onClick={() => setDetailTargetId(k._id)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        setDetailTargetId(k._id);
                                    }
                                }}
                                className="group cursor-pointer rounded-2xl border border-default bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-accent to-purple-500 text-sm font-bold text-accent-foreground">
                                            {initial}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-primary">
                                                {buyer?.name ?? "Buyer"}
                                            </p>
                                            <p className="truncate text-xs text-muted">{buyer?.email}</p>
                                        </div>
                                    </div>
                                    <KhataStatusBadge status={k.status} />
                                </div>

                                {k.requestNote && (
                                    <p className="mt-3 line-clamp-2 rounded-lg bg-surface-muted px-3 py-2 text-xs italic text-secondary">
                                        "{k.requestNote}"
                                    </p>
                                )}

                                {k.status === "approved" && (
                                    <div className="mt-3 space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted">
                                                ₹{k.outstandingBalance.toLocaleString("en-IN")} of ₹
                                                {k.creditLimit.toLocaleString("en-IN")}
                                            </span>
                                            <span className="font-semibold text-primary">{usagePct}%</span>
                                        </div>
                                        <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                                            <div
                                                className={`h-full rounded-full transition-all ${usagePct >= 90 ? "bg-danger-text" : "bg-accent"
                                                    }`}
                                                style={{ width: `${usagePct}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {k.status === "pending" && (
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setApproveTarget(k);
                                            }}
                                            className="flex-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setRejectTarget(k);
                                            }}
                                            className="flex-1 rounded-lg border border-default px-3 py-1.5 text-xs font-semibold text-secondary transition-colors hover:bg-surface-hover"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <KhataApproveModal khata={approveTarget} onClose={() => setApproveTarget(null)} />
            <KhataRejectModal khata={rejectTarget} onClose={() => setRejectTarget(null)} />
        </div>
    );
}