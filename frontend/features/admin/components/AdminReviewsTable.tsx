"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import api from "@/services/axios";

interface AdminReview {
    _id: string;
    rating: number;
    comment?: string;
    helpfulCount: number;
    createdAt: string;
    product: { _id: string; name: string; images: string[] };
    buyer: { _id: string; name: string; email: string };
}

export default function AdminReviewsTable() {
    const [reviews, setReviews] = useState<AdminReview[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [ratingFilter, setRatingFilter] = useState<string>("");
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const fetchReviews = (p: number = 1) => {
        setLoading(true);
        api
            .get("/admin/reviews", { params: { page: p, rating: ratingFilter || undefined } })
            .then(({ data }) => {
                setReviews(data.reviews);
                setTotal(data.total);
                setPage(data.page);
                setPages(data.pages);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchReviews(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ratingFilter]);

    const handleDelete = async (id: string) => {
        if (confirmDeleteId !== id) {
            setConfirmDeleteId(id);
            return;
        }
        await api.delete(`/admin/reviews/${id}`);
        setReviews((prev) => prev.filter((r) => r._id !== id));
        setTotal((t) => Math.max(0, t - 1));
        setConfirmDeleteId(null);
    };

    return (
        <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-primary sm:text-2xl">
                        Review Moderation
                    </h1>
                    <p className="text-sm text-secondary">{total} total reviews</p>
                </div>

                <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary"
                >
                    <option value="">All ratings</option>
                    <option value="1">1★ only</option>
                    <option value="2">2★ only</option>
                    <option value="3">3★ only</option>
                    <option value="4">4★ only</option>
                    <option value="5">5★ only</option>
                </select>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-muted" />
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-default bg-surface py-16 text-center">
                    <p className="text-sm text-secondary">No reviews match this filter.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reviews.map((review) => (
                        <div
                            key={review._id}
                            className="flex flex-col gap-3 rounded-2xl border border-default bg-surface p-4 shadow-sm sm:flex-row sm:items-start"
                        >
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                                {review.product?.images?.[0] && (
                                    <Image
                                        src={review.product.images[0]}
                                        alt=""
                                        fill
                                        sizes="56px"
                                        className="object-cover"
                                    />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-primary">
                                        {review.product?.name ?? "Deleted product"}
                                    </span>
                                    <span className="text-xs text-amber-500">
                                        {"★".repeat(review.rating)}
                                        <span className="text-muted">{"★".repeat(5 - review.rating)}</span>
                                    </span>
                                </div>
                                <p className="text-xs text-muted">
                                    by {review.buyer?.name ?? "Deleted user"} ({review.buyer?.email}) ·{" "}
                                    {new Date(review.createdAt).toLocaleDateString("en-IN")}
                                </p>
                                {review.comment && (
                                    <p className="mt-2 text-sm text-secondary">{review.comment}</p>
                                )}
                                <p className="mt-1 text-xs text-muted">
                                    {review.helpfulCount} found this helpful
                                </p>
                            </div>

                            <div className="shrink-0">
                                {confirmDeleteId === review._id ? (
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => handleDelete(review._id)}
                                            className="rounded-lg bg-danger-solid px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                                        >
                                            Confirm delete
                                        </button>
                                        <button
                                            onClick={() => setConfirmDeleteId(null)}
                                            className="rounded-lg border border-default px-3 py-1.5 text-xs text-secondary hover:bg-surface-hover"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleDelete(review._id)}
                                        className="rounded-lg border border-danger-bg px-3 py-1.5 text-xs font-medium text-danger-text hover:bg-danger-bg"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {pages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                        disabled={page <= 1}
                        onClick={() => fetchReviews(page - 1)}
                        className="rounded-lg border border-default px-3 py-1.5 text-sm disabled:opacity-40"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-secondary">
                        Page {page} of {pages}
                    </span>
                    <button
                        disabled={page >= pages}
                        onClick={() => fetchReviews(page + 1)}
                        className="rounded-lg border border-default px-3 py-1.5 text-sm disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}