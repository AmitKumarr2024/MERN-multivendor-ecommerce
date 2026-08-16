"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useImageUpload } from "../hook/useImageUpload";
import type { UploadFolder } from "../types/upload.types";

interface ImageUploadFieldProps {
    label: string;
    value?: string;
    onChange: (url: string, publicId: string) => void;
    folder: Exclude<UploadFolder, "product-images">;
    shape?: "square" | "wide" | "circle";
    helperText?: string;
}

/**
 * Reusable single-image upload field — drop this anywhere a shop logo,
 * shop banner, or user avatar needs uploading. Handles preview, progress,
 * validation, and error states; only calls onChange with the final
 * Cloudinary URL once the upload actually succeeds.
 */
export default function ImageUploadField({
    label,
    value,
    onChange,
    folder,
    shape = "square",
    helperText,
}: ImageUploadFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const { uploading, progress, error, upload, reset } = useImageUpload(folder);
    const [preview, setPreview] = useState<string | undefined>(value);

    useEffect(() => {
        setPreview(value);
    }, [value]);

    const handleFile = async (file: File) => {
        reset();
        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);

        const result = await upload(file);
        if (result) {
            onChange(result.url, result.publicId);
            setPreview(result.url);
        } else {
            setPreview(value);
        }
    };

    const dims =
        shape === "wide" ? "h-28 w-full sm:h-32" : shape === "circle" ? "h-24 w-24 rounded-full" : "h-24 w-24";
    const radius = shape === "circle" ? "rounded-full" : "rounded-xl";

    // The box's actual on-screen width varies a lot by shape: square/circle
    // are small fixed thumbnails, but "wide" stretches to the full form
    // width (can be 500-700px+ on desktop). A single hardcoded "200px" was
    // causing the browser to fetch a too-small image and upscale it for
    // wide banners, which is what produced the blur. Match `sizes` to the
    // real rendered width per shape so the browser requests the right size.
    const imageSizes =
        shape === "wide"
            ? "(max-width: 640px) 100vw, 700px"
            : "96px";

    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-primary">{label}</label>

            <div
                onClick={() => !uploading && inputRef.current?.click()}
                className={`group relative cursor-pointer overflow-hidden border-2 border-dashed border-strong bg-surface-muted transition-colors hover:border-accent ${dims} ${radius}`}
            >
                {preview ? (
                    <Image
                        src={preview}
                        alt={label}
                        fill
                        sizes={imageSizes}
                        quality={90}
                        className="object-cover object-center"
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-1 text-muted">
                        <UploadIcon />
                        <span className="px-2 text-center text-[11px] font-medium">Click to upload</span>
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-surface/80 backdrop-blur-[1px]">
                        <span className="text-xs font-semibold text-primary">{progress}%</span>
                        <div className="h-1 w-2/3 overflow-hidden rounded-full bg-surface-muted">
                            <div
                                className="h-full rounded-full bg-accent transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {preview && !uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
                        <span className="text-xs font-semibold text-white">Change</span>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                        e.target.value = "";
                    }}
                />
            </div>

            {helperText && !error && <p className="mt-1.5 text-xs text-muted">{helperText}</p>}
            {error && <p className="mt-1.5 text-xs text-danger-text">{error}</p>}
        </div>
    );
}

function UploadIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
            <path
                d="M10 13V4m0 0L6.5 7.5M10 4l3.5 3.5M4 14v1.5A1.5 1.5 0 005.5 17h9a1.5 1.5 0 001.5-1.5V14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}