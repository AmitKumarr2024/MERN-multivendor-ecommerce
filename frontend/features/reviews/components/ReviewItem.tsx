"use client";

import { useState } from "react";
import Image from "next/image";
import RatingStars from "./RatingStars";
import type { Review } from "../types/review.types";

interface ReviewItemProps {
    review: Review;
    canReply?: boolean;
    onReply?: (reviewId: string, text: string) => void;
    onHelpful?: (reviewId: string) => void;
}

function ReplyInline({
    reviewId,
    onReply,
}: {
    reviewId: string;
    onReply?: (id: string, text: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");

    if (!open) {
        return (
            <button type="button" onClick={() => setOpen(true)} className="text-xs text-blue-500 hover:underline">
                Reply
            </button>
        );
    }

    return (
        <div className="flex flex-1 items-center gap-2">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 rounded-lg border border-default bg-surface px-2 py-1 text-xs text-primary"
            />
            <button
                type="button"
                onClick={() => {
                    if (text.trim()) onReply?.(reviewId, text.trim());
                    setOpen(false);
                    setText("");
                }}
                className="text-xs font-medium text-blue-500"
            >
                Post
            </button>
        </div>
    );
}

export default function ReviewItem({ review, canReply, onReply, onHelpful }: ReviewItemProps) {
    return (
        <div className="border-b border-default py-4 last:border-0">
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                    {review.buyer.avatar ? (
                        <Image src={review.buyer.avatar} alt={review.buyer.name} width={36} height={36} className="object-cover" />
                    ) : (
                        review.buyer.name?.[0]?.toUpperCase() ?? "U"
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-primary">{review.buyer.name}</span>
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
                            Verified Purchase
                        </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                        <RatingStars value={review.rating} size="sm" />
                        <span className="text-xs text-muted">
                            {new Date(review.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })}
                        </span>
                    </div>

                    {review.comment && (
                        <p className="mt-2 text-sm leading-relaxed text-secondary">{review.comment}</p>
                    )}

                    {review.images && review.images.length > 0 && (
                        <div className="mt-2 flex gap-2">
                            {review.images.map((img, i) => (
                                <div key={i} className="relative h-14 w-14 overflow-hidden rounded-lg bg-surface-muted">
                                    <Image src={img} alt="" fill sizes="56px" className="object-cover" />
                                </div>
                            ))}
                        </div>
                    )}

                    {review.sellerReply?.text && (
                        <div className="mt-3 rounded-lg bg-surface-muted p-3">
                            <p className="text-xs font-semibold text-primary">Seller response</p>
                            <p className="mt-0.5 text-xs text-secondary">{review.sellerReply.text}</p>
                        </div>
                    )}

                    <div className="mt-2 flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => onHelpful?.(review._id)}
                            className="text-xs text-muted hover:text-secondary"
                        >
                            Helpful ({review.helpfulCount})
                        </button>

                        {canReply && !review.sellerReply?.text && (
                            <ReplyInline reviewId={review._id} onReply={onReply} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}