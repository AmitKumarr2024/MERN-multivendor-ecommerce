"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadMultipleImages, validateImageFile, deleteUploadedImage, MAX_PRODUCT_IMAGES } from "../store/uploadService";
import type { UploadResult } from "../types/upload.types";

interface MultiImageUploadFieldProps {
    label?: string;
    value: UploadResult[];
    onChange: (images: UploadResult[]) => void;
    max?: number;
}

/**
 * Product gallery upload — up to 5 images (MAX_PRODUCT_IMAGES),
 * matches POST /api/upload/product-images. Supports removing individual
 * images (calls DELETE /api/upload/image, ownership-checked server-side).
 */
export default function MultiImageUploadField({
    label = "Product images",
    value,
    onChange,
    max = MAX_PRODUCT_IMAGES,
}: MultiImageUploadFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [removingId, setRemovingId] = useState<string | null>(null);

    const remainingSlots = max - value.length;

    const handleFiles = async (files: FileList) => {
        setError(null);
        const fileArray = Array.from(files);

        if (fileArray.length > remainingSlots) {
            setError(`You can only add ${remainingSlots} more image${remainingSlots !== 1 ? "s" : ""}.`);
            return;
        }

        for (const file of fileArray) {
            const validationError = validateImageFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }
        }

        setUploading(true);
        setProgress(0);
        try {
            const results = await uploadMultipleImages(fileArray, setProgress);
            onChange([...value, ...results]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async (publicId: string) => {
        setRemovingId(publicId);
        try {
            await deleteUploadedImage(publicId);
            onChange(value.filter((img) => img.publicId !== publicId));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to remove image");
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-medium text-primary">{label}</label>
                <span className="text-xs text-muted">
                    {value.length} / {max}
                </span>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {value.map((img) => (
                    <div
                        key={img.publicId}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-default bg-surface-muted"
                    >
                        <Image src={img.url} alt="" fill sizes="120px" className="object-cover" />
                        <button
                            type="button"
                            onClick={() => handleRemove(img.publicId)}
                            disabled={removingId === img.publicId}
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100 disabled:opacity-50"
                            aria-label="Remove image"
                        >
                            {removingId === img.publicId ? (
                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <CloseIcon />
                            )}
                        </button>
                    </div>
                ))}

                {remainingSlots > 0 && (
                    <button
                        type="button"
                        onClick={() => !uploading && inputRef.current?.click()}
                        disabled={uploading}
                        className="relative flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-strong bg-surface-muted text-muted transition-colors hover:border-accent disabled:opacity-60"
                    >
                        {uploading ? (
                            <>
                                <span className="text-xs font-semibold text-primary">{progress}%</span>
                                <div className="h-1 w-2/3 overflow-hidden rounded-full bg-surface">
                                    <div
                                        className="h-full rounded-full bg-accent transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <PlusIcon />
                                <span className="text-[11px] font-medium">Add</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                        handleFiles(e.target.files);
                    }
                    e.target.value = "";
                }}
            />

            {error && <p className="mt-2 text-xs text-danger-text">{error}</p>}
        </div>
    );
}

function PlusIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}