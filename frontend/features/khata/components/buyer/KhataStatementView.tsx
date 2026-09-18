"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMonthlyStatement, clearStatement } from "../../store/khataSlice";
import { selectKhataStatement } from "../../store/khataSelectors";
import KhataTransactionList from "../shared/KhataTransactionList";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default function KhataStatementView({ khataId, asSeller }: { khataId: string; asSeller?: boolean }) {
  const dispatch = useAppDispatch();
  const statement = useAppSelector(selectKhataStatement);
  const [month, setMonth] = useState(currentMonth());

  useEffect(() => {
    dispatch(fetchMonthlyStatement({ id: khataId, month, asSeller }));
    return () => {
      dispatch(clearStatement());
    };
  }, [dispatch, khataId, month, asSeller]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Month:</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
        />
      </div>

      {statement && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Opening" value={statement.openingBalance} />
            <Stat label="Purchases" value={statement.totalCredits} />
            <Stat label="Payments" value={statement.totalPayments} />
            <Stat label="Closing" value={statement.closingBalance} highlight />
          </div>
          <KhataTransactionList transactions={statement.transactions} />
        </>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border border-border p-3 ${highlight ? "bg-accent/10" : "bg-card"}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-base font-semibold">₹{value.toLocaleString()}</p>
    </div>
  );
}