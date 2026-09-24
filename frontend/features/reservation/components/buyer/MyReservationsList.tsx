"use client";
import { useEffect } from "react";
import { PackageCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyReservations, cancelReservation } from "../../store/reservationSlice";
import { selectMyReservations, selectMyReservationsLoading, selectReservationActionLoading } from "../../store/reservationSelectors";
import ReservationStatusBadge from "../ReservationStatusBadge";

const CANCELLABLE = ["pending", "confirmed", "ready"];

export default function MyReservationsList() {
  const dispatch = useAppDispatch();
  const reservations = useAppSelector(selectMyReservations);
  const loading = useAppSelector(selectMyReservationsLoading);
  const acting = useAppSelector(selectReservationActionLoading);

  useEffect(() => { dispatch(fetchMyReservations()); }, [dispatch]);

  if (loading) return <div className="mx-auto max-w-4xl space-y-3 p-4">{[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-muted" />)}</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent"><PackageCheck className="h-5 w-5" /></div>
        <div>
          <h1 className="text-xl font-bold text-primary">My reservations</h1>
          <p className="text-sm text-secondary">Products reserved for in-store pickup.</p>
        </div>
      </div>

      {reservations.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-default py-14 text-center text-sm text-secondary">
          No reservations yet.
        </p>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => {
            const shop = typeof r.shop === "string" ? null : r.shop;
            return (
              <div key={r._id} className="rounded-2xl border border-default bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-primary">{r.productName}{r.variantLabel ? ` (${r.variantLabel})` : ""}</p>
                    <p className="mt-0.5 text-xs text-muted">{shop?.shopName ?? "Shop"} · Qty {r.quantity} · ₹{r.unitPrice}</p>
                  </div>
                  <ReservationStatusBadge status={r.status} />
                </div>

                {r.status === "pending" && <p className="mt-2 text-xs text-warning-text">Awaiting seller confirmation — expires {new Date(r.expiresAt).toLocaleString("en-IN")}.</p>}
                {r.status === "confirmed" && r.pickupDeadline && <p className="mt-2 text-xs text-info-text">Confirmed — pick up before {new Date(r.pickupDeadline).toLocaleString("en-IN")}.</p>}
                {r.status === "ready" && <p className="mt-2 text-xs text-success-text">Ready — head to the shop to collect it.</p>}
                {r.status === "cancelled" && r.rejectionReason && <p className="mt-2 text-xs text-danger-text">Rejected: {r.rejectionReason}</p>}

                {CANCELLABLE.includes(r.status) && (
                  <button
                    type="button"
                    onClick={() => dispatch(cancelReservation({ id: r._id }))}
                    disabled={acting}
                    className="mt-3 text-xs font-semibold text-danger-text hover:underline disabled:opacity-50"
                  >
                    Cancel reservation
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}