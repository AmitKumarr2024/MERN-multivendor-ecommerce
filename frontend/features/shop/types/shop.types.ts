// =========================================================
// ADDRESS
// =========================================================

export interface ShopAddress {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

// =========================================================
// BUSINESS HOURS
// =========================================================

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

// =========================================================
// OWNER
// =========================================================

export interface ShopOwner {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

// =========================================================
// SHOP
// =========================================================

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

  /**
   * Holiday dates in YYYY-MM-DD format.
   */
  holidayDates: string[];

  isVerified: boolean;

  isActive: boolean;

  /**
   * Only present on:
   *
   * GET /api/shops/:slug
   *
   * Computed by the backend.
   */
  isOpen?: boolean;

  createdAt: string;

  updatedAt: string;
}

// =========================================================
// PUBLIC SHOP
// =========================================================

/**
 * Public storefront representation of a shop.
 *
 * Internal owner information and timestamps are intentionally
 * excluded from the public shop shape.
 */
export type PublicShop = Pick<
  Shop,
  | "_id"
  | "shopName"
  | "slug"
  | "logo"
  | "banner"
  | "description"
  | "address"
  | "contactPhone"
  | "contactEmail"
  | "businessHours"
  | "holidayDates"
  | "isVerified"
  | "isOpen"
>;

export interface GetAllShopsResponse {
  shops: ShopListItem[];

  total: number;

  page: number;

  pages: number;
}

// =========================================================
// SLUG CHECK
// =========================================================

export interface SlugCheckResponse {
  slug: string;

  available: boolean;
}

// =========================================================
// SHOP OPEN STATUS
// =========================================================

export interface IsOpenResponse {
  slug: string;

  isOpen: boolean;

  businessHours: BusinessHours;
}

// =========================================================
// TOGGLE ACTIVE
// =========================================================

export interface ToggleActiveResponse {
  _id: string;

  isActive: boolean;
}

// =========================================================
// CREATE SHOP
// =========================================================

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

// =========================================================
// UPDATE SHOP
// =========================================================

export type UpdateShopPayload = Partial<Omit<CreateShopPayload, "slug">>;

// =========================================================
// UPDATE SLUG
// =========================================================

export interface UpdateSlugPayload {
  slug: string;
}

// =========================================================
// BUSINESS HOURS UPDATE
// =========================================================

/**
 * Partial map of days to update.
 *
 * Example:
 *
 * {
 *     monday: {
 *         open: "09:00",
 *         close: "18:00"
 *     }
 * }
 */
export type BusinessHoursUpdatePayload = Partial<
  Record<DayName, Partial<DayHours>>
>;

// =========================================================
// HOLIDAYS
// =========================================================

export interface HolidayUpdatePayload {
  action: "add" | "remove";

  /**
   * YYYY-MM-DD
   */
  date: string;
}

// =========================================================
// SHOP QUERY
// =========================================================

export interface ShopQueryParams {
  search?: string;

  page?: number;

  limit?: number;
}

export interface ShopListItem {
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
  holidayDates: string[];

  isVerified: boolean;
  isActive: boolean;

  isOpen: boolean;

  staffCount: number;

  createdAt?: string;
  updatedAt?: string;
}
