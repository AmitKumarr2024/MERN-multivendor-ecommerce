"use client";

import { Plus, Users } from "lucide-react";
import Button from "@/components/ui/Button";

interface StaffEmptyStateProps {
  onAdd: () => void;
}

export default function StaffEmptyState({ onAdd }: StaffEmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-default bg-surface-muted/30 px-5 py-12 text-center sm:px-8 sm:py-16">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-surface text-muted shadow-sm">
        <Users className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-lg font-bold text-primary">Build your shop team</h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-secondary">
        Add staff members to showcase your team and manage their attendance from one place.
      </p>

      <div className="mt-6">
        <Button onClick={onAdd}>
          <span className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add your first staff member
          </span>
        </Button>
      </div>
    </div>
  );
}