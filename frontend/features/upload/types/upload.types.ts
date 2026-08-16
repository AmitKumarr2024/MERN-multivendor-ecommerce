export type UploadFolder = "shop-logo" | "shop-banner" | "avatar" | "product-images";

export interface UploadResult {
    url: string;
    publicId: string;
}

export interface UploadState {
    uploading: boolean;
    progress: number;
    error: string | null;
}