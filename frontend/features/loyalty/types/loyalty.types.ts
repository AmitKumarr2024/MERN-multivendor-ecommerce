export interface LoyaltyProgram {
  enabled: boolean;
  pointsPerUnit: number;
  spendAmount: number;
  minRedeemPoints: number;
  rewardValue: number;
  expiryDays: number | null;
}

export interface LoyaltyShopRef {
  _id: string;
  shopName: string;
  slug?: string;
  logo?: string;
}
export interface LoyaltyBuyerRef {
  _id: string;
  name: string;
  email: string;
}

export interface LoyaltyAccount {
  _id?: string;
  shop?: string | LoyaltyShopRef;
  buyer?: string | LoyaltyBuyerRef;
  balance: number;
  totalEarned: number;
  totalRedeemed: number;
  totalExpired: number;
  updatedAt?: string;
}

export type LoyaltyTxType =
  | "earn"
  | "redeem"
  | "reversal"
  | "expire"
  | "adjust";

export interface LoyaltyTransaction {
  _id: string;
  type: LoyaltyTxType;
  points: number;
  balanceAfter: number;
  note?: string;
  order?: string;
  expiresAt?: string | null;
  createdAt: string;
}

export interface LoyaltyRedemption {
  _id: string;
  code: string;
  points: number;
  value: number;
  status: "issued" | "fulfilled";
  shop?: string | LoyaltyShopRef;
  buyer?: string | LoyaltyBuyerRef;
  createdAt: string;
  fulfilledAt?: string;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export interface CustomersResponse extends Paged<LoyaltyAccount> {
  summary: {
    customers: number;
    outstandingPoints: number;
    totalRedeemed: number;
  };
}
export interface CustomerTxResponse extends Paged<LoyaltyTransaction> {
  account: LoyaltyAccount;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  pointsCost: number;
  value: number;
  redeemableNow: number;
}
export interface ShopLoyalty {
  shop: LoyaltyShopRef;
  program: LoyaltyProgram;
  account: LoyaltyAccount;
  rewards: LoyaltyReward[];
  nextExpiry: { points: number; expiresAt: string } | null;
}
