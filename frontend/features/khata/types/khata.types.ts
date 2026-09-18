export type KhataStatus = "pending" | "approved" | "rejected" | "suspended";
export type KhataTransactionType = "credit_purchase" | "payment" | "adjustment";

export interface KhataShopRef {
  _id: string;
  shopName: string;
  logo?: string;
}

export interface KhataBuyerRef {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Khata {
  _id: string;
  shop: string | KhataShopRef;
  buyer: string | KhataBuyerRef;
  status: KhataStatus;
  creditLimit: number;
  outstandingBalance: number;
  requestNote?: string;
  rejectionReason?: string;
  suspendedReason?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KhataTransaction {
  _id: string;
  khata: string;
  shop: string;
  buyer: string;
  type: KhataTransactionType;
  amount: number; // positive = credit/purchase, negative = payment
  balanceAfter: number;
  order?: string;
  note?: string;
  recordedBy: string;
  statementMonth: string; // "YYYY-MM"
  settledAt?: string;
  createdAt: string;
}

export interface MonthlyStatement {
  statementMonth: string;
  openingBalance: number;
  closingBalance: number;
  totalCredits: number;
  totalPayments: number;
  transactions: KhataTransaction[];
}

export interface KhataSettlement {
  _id: string;
  khata: string;
  shop: string;
  statementMonth: string;
  openingBalance: number;
  closingBalance: number;
  totalCredits: number;
  totalPayments: number;
  closedBy: string;
  createdAt: string;
}

export interface ShopKhataStatus {
  khataEnabled: boolean;
  khata: Khata | null;
}

export interface KhataEligibility {
  eligible: boolean;
  reason?: "not_approved" | "insufficient_credit";
  availableCredit?: number;
}
