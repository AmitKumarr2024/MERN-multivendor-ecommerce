"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCustomers, fetchTopCustomers, fetchCustomerTx, adjustPoints, clearCustomerTx, clearLoyaltyError } from "../../store/loyaltySlice";
import { selectLoyaltyCustomers, selectTopCustomers, selectCustomerTx, selectLoyaltyActionLoading, selectLoyaltyError } from "../../store/loyaltySelectors";
import type { LoyaltyAccount } from "../../types/loyalty.types";
import Modal from "@/components/ui/Modal";
import TxList from "../shared/TxList";

const buyerOf = (a: LoyaltyAccount) => (typeof a.buyer === "object" && a.buyer ? a.buyer : null);

export default function LoyaltyCustomers({ shopId }: { shopId: string }) {
    const dispatch = useAppDispatch();
    const data = useAppSelector(selectLoyaltyCustomers);
    const top = useAppSelector(selectTopCustomers);
    const txData = useAppSelector(selectCustomerTx);
    const acting = useAppSelector(selectLoyaltyActionLoading);
    const error = useAppSelector(selectLoyaltyError);

    const [view, setView] = useState<"all" | "top">("all");
    const [search, setSearch] = useState("");
    const [q, setQ] = useState("");
    const [sort, setSort] = useState("recent");
    const [page, setPage] = useState(1);
    const [historyFor, setHistoryFor] = useState<LoyaltyAccount | null>(null);
    const [adjustFor, setAdjustFor] = useState<LoyaltyAccount | null>(null);
    const [pts, setPts] = useState("");
    const [reason, setReason] = useState("");

    useEffect(() => { const t = setTimeout(() => { setQ(search); setPage(1); }, 300); return () => clearTimeout(t); }, [search]);
    useEffect(() => { dispatch(fetchCustomers({ shopId, search: q, sort, page })); }, [dispatch, shopId, q, sort, page]);
    useEffect(() => { if (view === "top") dispatch(fetchTopCustomers(shopId)); }, [dispatch, shopId, view]);

    const rows = view === "top" ? top : data?.items ?? [];
    const closeAdjust = () => { setAdjustFor(null); setPts(""); setReason(""); dispatch(clearLoyaltyError()); };

    const submitAdjust = async () => {
        const b = adjustFor && buyerOf(adjustFor);
        if (!b || !Number(pts) || reason.trim().length < 3) return;
        const r = await dispatch(adjustPoints({ shopId, buyerId: b._id, points: Number(pts), reason: reason.trim() }));
        if (adjustPoints.fulfilled.match(r)) { closeAdjust(); dispatch(fetchCustomers({ shopId, search: q, sort, page })); if (view === "top") dispatch(fetchTopCustomers(shopId)); }
    };

    return (
        <div className="space-y-4">
            {data && (
                <div className="grid grid-cols-3 gap-3">
                    {[["Customers", data.summary.customers], ["Points outstanding", data.summary.outstandingPoints], ["Points redeemed", data.summary.totalRedeemed]].map(([l, v]) => (
                        <div key={l as string} className="rounded-2xl border border-default bg-surface p-4"><p className="text-xl font-bold text-primary">{v}</p><p className="text-xs text-muted">{l}</p></div>
                    ))}
                </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex gap-1 rounded-xl border border-default bg-surface p-1">
                    {(["all", "top"] as const).map((v) => (
                        <button key={v} onClick={() => setView(v)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${view === v ? "bg-accent text-accent-foreground" : "text-secondary hover:bg-surface-hover"}`}>{v === "all" ? "All customers" : "Top customers"}</button>
                    ))}
                </div>
                {view === "all" && (
                    <div className="flex gap-2">
                        <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email" className="rounded-xl border border-default bg-surface py-2 pl-9 pr-3 text-sm text-primary focus:border-accent focus:outline-none" /></div>
                        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="rounded-xl border border-default bg-surface px-3 py-2 text-sm text-primary">
                            <option value="recent">Recent</option><option value="balance">Balance</option><option value="earned">Lifetime earned</option><option value="redeemed">Redeemed</option>
                        </select>
                    </div>
                )}
            </div>

            {rows.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-default py-12 text-center text-sm text-secondary">No loyalty customers yet. They appear after their first delivered order.</p>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-default bg-surface">
                    <table className="w-full min-w-[640px] text-sm">
                        <thead><tr className="border-b border-default bg-surface-muted/50 text-left text-xs font-semibold text-muted">
                            {view === "top" && <th className="px-4 py-3">#</th>}<th className="px-4 py-3">Customer</th><th className="px-4 py-3">Balance</th><th className="px-4 py-3">Earned</th><th className="px-4 py-3">Redeemed</th><th className="px-4 py-3 text-right">Actions</th>
                        </tr></thead>
                        <tbody className="divide-y divide-default">
                            {rows.map((a, i) => {
                                const b = buyerOf(a); return (
                                    <tr key={a._id} className="hover:bg-surface-hover">
                                        {view === "top" && <td className="px-4 py-3 font-bold text-primary">{i + 1}</td>}
                                        <td className="px-4 py-3"><p className="font-semibold text-primary">{b?.name ?? "Customer"}</p><p className="text-xs text-muted">{b?.email}</p></td>
                                        <td className={`px-4 py-3 font-bold ${a.balance < 0 ? "text-danger-text" : "text-primary"}`}>{a.balance}</td>
                                        <td className="px-4 py-3 text-secondary">{a.totalEarned}</td>
                                        <td className="px-4 py-3 text-secondary">{a.totalRedeemed}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => { setHistoryFor(a); if (b) dispatch(fetchCustomerTx({ shopId, buyerId: b._id })); }} className="mr-2 text-xs font-semibold text-accent hover:underline">History</button>
                                            <button onClick={() => setAdjustFor(a)} className="text-xs font-semibold text-secondary hover:text-primary">Adjust</button>
                                        </td>
                                    </tr>);
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {view === "all" && data && data.pages > 1 && (
                <div className="flex items-center justify-center gap-3 text-sm text-secondary">
                    <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-default px-3 py-1.5 disabled:opacity-40">Prev</button>
                    Page {data.page} of {data.pages}
                    <button disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-default px-3 py-1.5 disabled:opacity-40">Next</button>
                </div>
            )}

            <Modal open={!!historyFor} onClose={() => { setHistoryFor(null); dispatch(clearCustomerTx()); }} title="Points history" subtitle={historyFor ? buyerOf(historyFor)?.name : undefined}>
                <TxList items={txData?.items ?? []} />
            </Modal>

            <Modal open={!!adjustFor} onClose={closeAdjust} title="Adjust points" subtitle={adjustFor ? buyerOf(adjustFor)?.name : undefined}>
                <div className="space-y-3">
                    <p className="rounded-xl bg-warning-bg p-3 text-xs text-warning-text">Every adjustment is recorded permanently with your name and reason. Use a negative number to deduct.</p>
                    <input type="number" value={pts} onChange={(e) => setPts(e.target.value)} placeholder="e.g. 50 or -20" className="w-full rounded-xl border border-default bg-surface px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none" />
                    <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} maxLength={300} placeholder="Reason (required)" className="w-full rounded-xl border border-default bg-surface p-3 text-sm text-primary focus:border-accent focus:outline-none" />
                    {error && <p className="text-sm text-danger-text">{error}</p>}
                    <button onClick={submitAdjust} disabled={acting || !Number(pts) || reason.trim().length < 3} className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-50">{acting ? "Saving..." : "Apply adjustment"}</button>
                </div>
            </Modal>
        </div>
    );
}