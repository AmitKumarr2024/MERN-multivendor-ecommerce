export type DiscountType = "percentage" | "fixed";
export type OfferScope = "shop" | "category" | "product";

export interface Offer {
  _id: string;
  shop: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount: number | null;
  scope: OfferScope;
  applicableProducts: string[];
  applicableCategories: string[];
  startDate: string | null;
  endDate: string | null;
  usageLimit: number | null;
  perCustomerLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferPayload {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  scope?: OfferScope;
  applicableProducts?: string[];
  applicableCategories?: string[];
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  perCustomerLimit?: number;
  isActive?: boolean;
}

export type UpdateOfferPayload = Partial<CreateOfferPayload> & {
  id: string;
  shopId: string;
};

export interface CouponValidationResult {
  eligible: boolean;
  reason?: string;
  offer?: Offer;
  eligibleSubtotal?: number;
  discountAmount?: number;
  minOrderValue?: number;
}
