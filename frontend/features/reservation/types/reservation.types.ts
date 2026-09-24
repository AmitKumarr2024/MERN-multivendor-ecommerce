export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "ready"
  | "collected"
  | "cancelled"
  | "expired";

export interface ShopReservationStatus {
  reservationsEnabled: boolean;
  reservationExpiryHours: number;
  pickupWindowHours: number;
  pickupInstructions: string;
}

export interface ReservationShopRef {
  _id: string;
  shopName: string;
  slug: string;
  logo?: string;
}
export interface ReservationBuyerRef {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Reservation {
  _id: string;
  shop: ReservationShopRef | string;
  buyer: ReservationBuyerRef | string;
  product: string;
  variantId: string | null;
  quantity: number;
  productName: string;
  productImage: string;
  variantLabel: string | null;
  unitPrice: number;
  status: ReservationStatus;
  expiresAt: string;
  pickupDeadline: string | null;
  confirmedAt: string | null;
  readyAt: string | null;
  collectedAt: string | null;
  cancelledAt: string | null;
  cancelledBy: "buyer" | "seller" | "system" | null;
  cancelReason: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export interface PaginatedReservations {
  items: Reservation[];
  total: number;
  page: number;
  pages: number;
}

export interface CreateReservationPayload {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export interface ShopReservationSettingsPayload {
  enabled?: boolean;
  expiryHours?: number;
  pickupWindowHours?: number;
  pickupInstructions?: string;
}
