export type CustomerSegment = "new" | "returning" | "regular";

export interface FollowStatus {
  following: boolean;
  followerCount: number;
}

export interface ShopPublicStats {
  followerCount: number;
  customerCount: number;
}

export interface FollowedShop {
  followedAt: string;
  shop: {
    _id: string;
    shopName: string;
    slug: string;
    logo: string;
    banner: string;
    description?: string;
    address?: { city?: string; state?: string };
    isVerified: boolean;
    isOpen: boolean;
  };
}

export interface FollowedShopsResponse {
  items: FollowedShop[];
  total: number;
  page: number;
  pages: number;
}

export interface ShopCustomer {
  buyerId: string;
  name: string;
  email: string | null;
  segment: CustomerSegment;
  orderCount: number;
  totalSpent: number;
  firstOrderAt: string;
  lastOrderAt: string;
  lastActivityAt: string;
  isFollower: boolean;
}

export interface CustomerSummary {
  total: number;
  new: number;
  returning: number;
  regular: number;
  followers: number;
  totalRevenue: number;
}

export interface ShopCustomersResponse {
  items: ShopCustomer[];
  summary: CustomerSummary;
  rules: {
    WINDOW_DAYS: number;
    REGULAR_MIN_ORDERS: number;
    REGULAR_MIN_DELIVERED: number;
  };
  total: number;
  page: number;
  pages: number;
}

export interface CustomerQuery {
  shopId: string;
  segment?: CustomerSegment | "all";
  search?: string;
  sort?: "lastOrder" | "orders" | "spent" | "firstOrder";
  page?: number;
}
