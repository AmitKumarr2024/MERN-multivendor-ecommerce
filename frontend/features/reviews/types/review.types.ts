export interface ReviewBuyer {
  _id: string;
  name: string;
  avatar?: string;
}

export interface SellerReply {
  text: string | null;
  repliedAt: string | null;
}

export interface Review {
  _id: string;
  product: string;
  buyer: ReviewBuyer;
  order: string;
  rating: number;
  comment?: string;
  images?: string[];
  sellerReply?: SellerReply;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ReviewSort = "newest" | "oldest" | "highest" | "lowest" | "helpful";

export interface RatingBreakdown {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export interface GetProductReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  pages: number;
  ratingBreakdown: RatingBreakdown;
}

export interface EligibleOrder {
  orderId: string;
  deliveredOn: string;
}

export interface ReviewEligibilityResponse {
  canReview: boolean;
  eligibleOrders: EligibleOrder[];
}

export interface CreateReviewPayload {
  productId: string;
  orderId: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export interface UpdateReviewPayload {
  id: string;
  rating?: number;
  comment?: string;
  images?: string[];
}

export interface ReplyToReviewPayload {
  id: string;
  text: string;
}
