import axios from "axios";
import api from "@/services/axios";
import type { UploadFolder, UploadResult } from "../types/upload.types";

function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        return (
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Upload failed"
        );
    }
    if (error instanceof Error) return error.message;
    return "Upload failed";
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB, matches backend limit
const MAX_PRODUCT_IMAGES = 5;

export function validateImageFile(file: File): string | null {
    if (!file.type.startsWith("image/")) {
        return "Please select an image file.";
    }
    if (file.size > MAX_FILE_SIZE) {
        return "Image must be under 5MB.";
    }
    return null;
}

/**
 * Single-image upload — matches backend's single-file endpoints:
 * POST /api/upload/shop-logo   (field: "image")
 * POST /api/upload/shop-banner (field: "image")
 * POST /api/upload/avatar      (field: "image")
 */
export async function uploadSingleImage(
    file: File,
    folder: Exclude<UploadFolder, "product-images">,
    onProgress?: (percent: number) => void
): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("image", file);

    try {
        const { data } = await api.post<UploadResult>(`/upload/${folder}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (evt) => {
                if (onProgress && evt.total) {
                    onProgress(Math.round((evt.loaded / evt.total) * 100));
                }
            },
        });
        return data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

/**
 * Multi-image upload — product gallery, up to 5 images.
 * POST /api/upload/product-images (field: "images", array)
 */
export async function uploadMultipleImages(
    files: File[],
    onProgress?: (percent: number) => void
): Promise<UploadResult[]> {
    if (files.length > MAX_PRODUCT_IMAGES) {
        throw new Error(`You can upload up to ${MAX_PRODUCT_IMAGES} images.`);
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    try {
        const { data } = await api.post<UploadResult[]>("/upload/product-images", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (evt) => {
                if (onProgress && evt.total) {
                    onProgress(Math.round((evt.loaded / evt.total) * 100));
                }
            },
        });
        return data;
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

/**
 * DELETE /api/upload/image — removes an uploaded image.
 * Backend verifies ownership via the Upload tracking model before deleting.
 */
export async function deleteUploadedImage(publicId: string): Promise<void> {
    try {
        await api.delete("/upload/image", { data: { publicId } });
    } catch (error) {
        throw new Error(getErrorMessage(error));
    }
}

export { MAX_FILE_SIZE, MAX_PRODUCT_IMAGES };