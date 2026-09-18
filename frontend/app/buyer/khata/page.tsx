"use client";

import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";

import {
    fetchMyKhatas,
} from "@/features/khata/store/khataSlice";

import {
    selectMyKhatas,
    selectKhataLoading,
    selectKhataError,
} from "@/features/khata/store/khataSelectors";

import { KhataDashboard } from "@/features/khata";

export default function KhataPage() {
    const dispatch = useAppDispatch();

    const khatas = useAppSelector(selectMyKhatas);
    const loading = useAppSelector(selectKhataLoading);
    const error = useAppSelector(selectKhataError);

    useEffect(() => {
        dispatch(fetchMyKhatas());
    }, [dispatch]);

    if (loading && khatas.length === 0) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-6">
                <div className="rounded-lg border border-default bg-surface p-6">
                    <p className="text-sm text-secondary">Loading Khata...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-6">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                    {error}
                </div>
            </div>
        );
    }

    if (khatas.length === 0) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-6">
                <div className="rounded-lg border border-default bg-surface p-6">
                    <h1 className="text-lg font-semibold text-primary">
                        Khata
                    </h1>

                    <p className="mt-2 text-sm text-secondary">
                        You don't have any active Khata accounts yet.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-6">
            <KhataDashboard khata={khatas[0]} />
        </div>
    );
}