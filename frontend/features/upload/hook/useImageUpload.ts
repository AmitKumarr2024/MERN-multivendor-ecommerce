"use client";

import { useState } from "react";
import { uploadSingleImage, validateImageFile } from "../store/uploadService";
import type { UploadFolder, UploadState } from "../types/upload.types";

interface UseImageUploadReturn extends UploadState {
    upload: (file: File) => Promise<{ url: string; publicId: string } | null>;
    reset: () => void;
}

/**
 * Single-image upload hook — for shop-logo, shop-banner, avatar.
 * Local/ephemeral state only, not Redux — an upload's progress/error
 * only matters to the one form field triggering it.
 */
export function useImageUpload(folder: Exclude<UploadFolder, "product-images">): UseImageUploadReturn {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const upload = async (file: File) => {
        setError(null);

        const validationError = validateImageFile(file);
        if (validationError) {
            setError(validationError);
            return null;
        }

        setUploading(true);
        setProgress(0);
        try {
            const result = await uploadSingleImage(file, folder, setProgress);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
            return null;
        } finally {
            setUploading(false);
        }
    };

    const reset = () => {
        setError(null);
        setProgress(0);
    };

    return { uploading, progress, error, upload, reset };
}