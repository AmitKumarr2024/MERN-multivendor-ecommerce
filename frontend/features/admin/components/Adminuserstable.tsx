"use client";

import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCurrentUser } from "@/features/auth/store/authSelector";
import {
    fetchUsers,
    updateUserRole,
    toggleUserBan,
    adminResetPassword,
    clearLastResetPassword,
} from "../store/Adminslice";
import {
    selectAdminError,
    selectAdminMutatingId,
    selectAdminUsers,
    selectLastResetPassword,
    selectUsersLoading,
    selectUsersPage,
    selectUsersPages,
    selectUsersTotal,
} from "../store/Adminselectors";
import type { UserRole } from "../types/Admin.types";

const ROLE_OPTIONS: UserRole[] = ["buyer", "seller", "admin"];

export default function AdminUsersTable() {
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector(selectCurrentUser);

    const users = useAppSelector(selectAdminUsers);
    const total = useAppSelector(selectUsersTotal);
    const page = useAppSelector(selectUsersPage);
    const pages = useAppSelector(selectUsersPages);
    const loading = useAppSelector(selectUsersLoading);
    const error = useAppSelector(selectAdminError);
    const mutatingId = useAppSelector(selectAdminMutatingId);
    const lastReset = useAppSelector(selectLastResetPassword);

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        dispatch(
            fetchUsers({
                search: search || undefined,
                role: roleFilter === "all" ? undefined : roleFilter,
                page: currentPage,
            }),
        );
    }, [dispatch, search, roleFilter, currentPage]);

    const handleRoleChange = (id: string, role: UserRole) => {
        dispatch(updateUserRole({ id, role }));
    };

    const handleBanToggle = (id: string) => {
        dispatch(toggleUserBan(id));
    };

    const handleResetPassword = (id: string) => {
        dispatch(adminResetPassword({ id }));
    };

    return (
        <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
            <div>
                <h1 className="text-xl font-semibold text-primary sm:text-2xl">Users</h1>
                {!loading && <p className="text-sm text-secondary">{total} total users</p>}
            </div>

            {lastReset && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/40">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className="font-medium text-amber-800 dark:text-amber-300">
                                Temporary password for {lastReset.email}
                            </p>
                            <p className="mt-1 font-mono text-amber-900 dark:text-amber-200">
                                {lastReset.temporaryPassword}
                            </p>
                            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                                Share this securely — it won&apos;t be shown again.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => dispatch(clearLastResetPassword())}
                            className="text-amber-700 hover:text-amber-900 dark:text-amber-400"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                    placeholder="Search name or email..."
                    className="flex-1 rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary focus:border-zinc-900 focus:outline-none dark:focus:border-zinc-100"
                />
                <select
                    value={roleFilter}
                    onChange={(e) => {
                        setRoleFilter(e.target.value as UserRole | "all");
                        setCurrentPage(1);
                    }}
                    className="rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary focus:border-zinc-900 focus:outline-none dark:focus:border-zinc-100"
                >
                    <option value="all">All roles</option>
                    {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                            {r}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-muted" />
                    ))}
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-default bg-surface shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-default text-left text-xs text-muted">
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Role</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => {
                                const busy = mutatingId === user._id;
                                const isSelf = user._id === currentUser?._id;
                                return (
                                    <tr key={user._id} className="border-b border-default last:border-0">
                                        <td className="px-4 py-3 font-medium text-primary">
                                            {user.name}
                                        </td>
                                        <td className="px-4 py-3 text-secondary">{user.email}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={user.role}
                                                disabled={busy || isSelf}
                                                onChange={(e) =>
                                                    handleRoleChange(
                                                        user._id,
                                                        e.target.value as UserRole,
                                                    )
                                                }
                                                className="rounded-md border border-default bg-surface px-2 py-1 text-xs text-primary disabled:opacity-50"
                                            >
                                                {ROLE_OPTIONS.map((r) => (
                                                    <option key={r} value={r}>
                                                        {r}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${user.isActive
                                                        ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                                                        : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                                                    }`}
                                            >
                                                {user.isActive ? "Active" : "Banned"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleBanToggle(user._id)}
                                                    disabled={busy || isSelf}
                                                    className="rounded-md border border-default px-2.5 py-1 text-xs font-medium text-secondary hover:bg-surface-hover disabled:opacity-50"
                                                >
                                                    {user.isActive ? "Ban" : "Unban"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleResetPassword(user._id)}
                                                    disabled={busy}
                                                    className="rounded-md border border-default px-2.5 py-1 text-xs font-medium text-secondary hover:bg-surface-hover disabled:opacity-50"
                                                >
                                                    Reset password
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="rounded-lg border border-default px-3 py-1.5 text-sm text-secondary disabled:opacity-40"
                    >
                        Prev
                    </button>
                    <span className="text-sm text-secondary">
                        Page {page} of {pages}
                    </span>
                    <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(pages, p + 1))}
                        disabled={page >= pages}
                        className="rounded-lg border border-default px-3 py-1.5 text-sm text-secondary disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}