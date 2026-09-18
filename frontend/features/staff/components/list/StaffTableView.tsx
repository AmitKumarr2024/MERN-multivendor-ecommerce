"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import type { Staff } from "../../types/staff.types";
import StaffTableRow from "./StaffTableRow";

interface StaffTableViewProps {
  roster: Staff[];
  shopId: string;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onRemove: (id: string, name: string) => void;
  onRefetch: () => void;
}

const PAGE_SIZE = 10;

export default function StaffTableView({ roster, shopId, onToggleStatus, onRemove, onRefetch }: StaffTableViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(roster.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedRoster = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return roster.slice(startIndex, startIndex + PAGE_SIZE);
  }, [roster, currentPage]);

  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis-left" | "ellipsis-right")[] = [];
    if (totalPages <= 7) {
      for (let page = 1; page <= totalPages; page++) pages.push(page);
      return pages;
    }
    pages.push(1);
    if (currentPage > 3) pages.push("ellipsis-left");
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    for (let page = startPage; page <= endPage; page++) pages.push(page);
    if (currentPage < totalPages - 2) pages.push("ellipsis-right");
    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  const startItem = roster.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, roster.length);
  const goToPage = (page: number) => setCurrentPage(Math.min(Math.max(page, 1), totalPages));

  return (
    <div className="overflow-hidden rounded-3xl border border-default bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-160 border-collapse">
          <thead>
            <tr className="border-b border-default bg-surface-muted/30">
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">Name</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">Role</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">Status</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">Rating</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">Experience</th>
              <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wide text-muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRoster.length > 0 ? (
              paginatedRoster.map((member) => (
                <StaffTableRow
                  key={member._id}
                  member={member}
                  shopId={shopId}
                  onToggleStatus={() => onToggleStatus(member._id, member.isActive)}
                  onRemove={() => onRemove(member._id, member.name)}
                  onRefetch={onRefetch}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-14 text-center">
                  <div className="mx-auto max-w-sm">
                    <p className="text-sm font-semibold text-primary">No team members found</p>
                    <p className="mt-1 text-xs text-muted">Add a staff member to start managing your shop team.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="border-t border-default bg-surface-muted/20 px-4 py-2 text-center text-[11px] text-muted md:hidden">
        Swipe left/right to see more columns →
      </p>

      {roster.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-default bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="text-center text-xs text-secondary sm:text-left">
            Showing <span className="font-semibold text-primary">{startItem}–{endItem}</span> of{" "}
            <span className="font-semibold text-primary">{roster.length}</span> team members
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5">
              <PaginationButton onClick={() => goToPage(1)} disabled={currentPage === 1} ariaLabel="First page">
                <ChevronsLeft className="h-4 w-4" />
              </PaginationButton>
              <PaginationButton onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} ariaLabel="Previous page">
                <ChevronLeft className="h-4 w-4" />
              </PaginationButton>

              <div className="flex items-center gap-1">
                {pageNumbers.map((page) => {
                  if (typeof page !== "number") {
                    return (
                      <span key={page} className="flex h-9 w-7 items-center justify-center text-xs text-muted">
                        …
                      </span>
                    );
                  }
                  const isActive = page === currentPage;
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => goToPage(page)}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-xs font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent/20 ${isActive ? "bg-accent text-accent-foreground shadow-sm" : "text-secondary hover:bg-surface-muted hover:text-primary"
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <PaginationButton onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} ariaLabel="Next page">
                <ChevronRight className="h-4 w-4" />
              </PaginationButton>
              <PaginationButton onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} ariaLabel="Last page">
                <ChevronsRight className="h-4 w-4" />
              </PaginationButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PaginationButton({
  children,
  onClick,
  disabled,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-default bg-surface text-secondary transition-all duration-150 hover:bg-surface-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}