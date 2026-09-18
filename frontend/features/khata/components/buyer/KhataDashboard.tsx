"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTransactionHistory } from "../../store/khataSlice";
import {
  selectKhataTransactions,
  selectAvailableCredit,
} from "../../store/khataSelectors";
import type { Khata } from "../../types/khata.types";
import MyKhatasList from "./MyKhatasList";
import KhataStatusBadge from "../shared/KhataStatusBadge";
import KhataTransactionList from "../shared/KhataTransactionList";

export default function KhataDashboard({
  khata,
}: {
  khata: Khata | null;
}) {
  if (!khata) {
    return <MyKhatasList />;
  }

  return <KhataDetails khata={khata} />;
}

function KhataDetails({ khata }: { khata: Khata }) {
  const dispatch = useAppDispatch();

  const transactions = useAppSelector(selectKhataTransactions);
  const available = selectAvailableCredit(khata);

  useEffect(() => {
    dispatch(
      fetchTransactionHistory({
        id: khata._id,
        asSeller: false,
      })
    );
  }, [dispatch, khata._id]);

  const shop = typeof khata.shop === "string" ? null : khata.shop;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {shop?.shopName ?? "Khata"}
        </h2>

        <KhataStatusBadge status={khata.status} />
      </div>

      {khata.status === "suspended" && khata.suspendedReason && (
        <div className="rounded-lg bg-orange-50 p-3 text-sm text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
          Your Khata is suspended: {khata.suspendedReason}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <StatBox
          label="Credit Limit"
          value={`₹${khata.creditLimit.toLocaleString()}`}
        />

        <StatBox
          label="Outstanding"
          value={`₹${khata.outstandingBalance.toLocaleString()}`}
        />

        <StatBox
          label="Available"
          value={`₹${available.toLocaleString()}`}
          highlight
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium">
          Transaction History
        </h3>

        <KhataTransactionList transactions={transactions} />
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-border p-3 ${highlight ? "bg-accent/10" : "bg-card"
        }`}
    >
      <p className="text-xs text-muted-foreground">{label}</p>

      <p
        className={`text-base font-semibold ${highlight ? "text-accent-foreground" : ""
          }`}
      >
        {value}
      </p>
    </div>
  );
}