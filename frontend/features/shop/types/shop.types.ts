export interface ShopAddress {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
}

export interface DayHours {
    open: string; // "HH:mm"
    close: string; // "HH:mm"
    isClosed: boolean;
}

export type DayName =
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";

export type BusinessHours = Record<DayName, DayHours>;

export interface ShopOwner {
    _id: string;
    name: string;
    email: string;
    phone?: string;
}

export interface Shop {
    _id: string;
    owner: ShopOwner | string;
    shopName: string;
    slug: string;
    logo: string;
    banner: string;
    description?: string;
    address?: ShopAddress;
    contactPhone?: string;
    contactEmail?: string;
    businessHours: BusinessHours;
    holidayDates: string[]; // "YYYY-MM-DD"
    isVerified: boolean;
    isActive: boolean;
    /** Only present on GET /api/shops/:slug (computed, not stored) */
    isOpen?: boolean;
    createdAt: string;
    updatedAt: string;
}

/* =========================================================
   RESPONSE SHAPES
========================================================= */

export interface GetAllShopsResponse {
    shops: Pick<Shop, "_id" | "shopName" | "slug" | "logo" | "description">[];
    total: number;
    page: number;
    pages: number;
}

export interface SlugCheckResponse {
    slug: string;
    available: boolean;
}

export interface IsOpenResponse {
    slug: string;
    isOpen: boolean;
    businessHours: BusinessHours;
}

export interface ToggleActiveResponse {
    _id: string;
    isActive: boolean;
}

/* =========================================================
   MUTATION PAYLOADS — mirrors shop.validation.js
========================================================= */

export interface CreateShopPayload {
    shopName: string;
    slug?: string;
    description?: string;
    logo?: string;
    banner?: string;
    address?: ShopAddress;
    contactPhone?: string;
    contactEmail?: string;
}

export type UpdateShopPayload = Partial<
    Omit<CreateShopPayload, "slug">
>;

export interface UpdateSlugPayload {
    slug: string;
}

/** Partial map of days to update — matches the loose backend schema. */
export type BusinessHoursUpdatePayload = Partial<
    Record<DayName, Partial<DayHours>>
>;

export interface HolidayUpdatePayload {
    action: "add" | "remove";
    date: string; // "YYYY-MM-DD"
}

export interface ShopQueryParams {
    search?: string;
    page?: number;
    limit?: number;
}