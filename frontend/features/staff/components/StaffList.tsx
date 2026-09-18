"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Plus, Users } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchStaffRoster, setStaffStatus, removeStaffMember } from "../store/staffSlice";
import { selectStaffRoster, selectStaffLoading } from "../store/staffSelectors";
import Button from "@/components/ui/Button";

import StaffForm from "./StaffForm";
import ViewToggle, { type StaffViewMode } from "./list/ViewToggle";
import StaffCardView from "./list/StaffCardView";
import StaffTableView from "./list/StaffTableView";
import StaffEmptyState from "./list/StaffEmptyState";
import StaffSkeleton from "./list/StaffSkeleton";
import Modal from "../ui/Modal";

interface StaffListProps {
  shopId: string;
}

const VIEW_STORAGE_KEY = "staff-list-view-mode";

export default function StaffList({ shopId }: StaffListProps) {
  const dispatch = useAppDispatch();

  const roster = useAppSelector(selectStaffRoster);
  const loading = useAppSelector(selectStaffLoading);

  const [showCreate, setShowCreate] = useState(false);
  const [view, setView] = useState<StaffViewMode>("card");

  useEffect(() => {
    dispatch(fetchStaffRoster(shopId));
  }, [dispatch, shopId]);

  useEffect(() => {
    const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (saved === "card" || saved === "table") setView(saved);
  }, []);

  const handleViewChange = (mode: StaffViewMode) => {
    setView(mode);
    window.localStorage.setItem(VIEW_STORAGE_KEY, mode);
  };

  const handleRemove = (staffId: string, name: string) => {
    if (confirm(`Remove ${name}? This can't be undone.`)) {
      dispatch(removeStaffMember(staffId));
    }
  };

  const handleToggleStatus = (staffId: string, isActive: boolean) => {
    dispatch(setStaffStatus({ staffId, isActive: !isActive }));
  };

  const refetch = () => dispatch(fetchStaffRoster(shopId));

  const handleCreateDone = () => {
    setShowCreate(false);
    refetch();
  };

  const activeCount = roster.filter((m) => m.isActive).length;
  const inactiveCount = roster.length - activeCount;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-primary">Team</h2>
            <p className="mt-1 text-sm text-secondary">Manage your shop staff, attendance and profiles.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {roster.length > 0 && <ViewToggle value={view} onChange={handleViewChange} />}
          <Button onClick={() => setShowCreate(true)}>
            <span className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add staff member
            </span>
          </Button>
        </div>
      </div>

      {loading && roster.length === 0 && <StaffSkeleton view={view} />}

      {!loading && roster.length === 0 && <StaffEmptyState onAdd={() => setShowCreate(true)} />}

      {roster.length > 0 &&
        (view === "card" ? (
          <StaffCardView
            roster={roster}
            shopId={shopId}
            onToggleStatus={handleToggleStatus}
            onRemove={handleRemove}
            onRefetch={refetch}
          />
        ) : (
          <StaffTableView
            roster={roster}
            shopId={shopId}
            onToggleStatus={handleToggleStatus}
            onRemove={handleRemove}
            onRefetch={refetch}
          />
        ))}

      {roster.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-default bg-surface-muted/30 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span className="text-secondary">
            {roster.length} {roster.length === 1 ? "team member" : "team members"}
          </span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-success-text">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {activeCount} active
            </span>
            <span className="text-muted">{inactiveCount} inactive</span>
          </div>
        </div>
      )}

      {showCreate && (
        <Modal title="Add staff member" icon={<Plus className="h-4.5 w-4.5" />} onClose={() => setShowCreate(false)}>
          <StaffForm shopId={shopId} onDone={handleCreateDone} />
        </Modal>
      )}
    </section>
  );
}