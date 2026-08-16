export type UserRole = "buyer" | "seller" | "admin";

export interface AdminUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    isActive: boolean;
    mustChangePassword?: boolean;
    shop?: { _id: string; shopName: string; slug: string } | string | null;
    createdAt: string;
}

export interface AdminShop {
    _id: string;
    shopName: string;
    slug: string;
    logo?: string;
    isVerified: boolean;
    isActive: boolean;
    owner: { _id: string; name: string; email: string } | string;
    createdAt: string;
}

export interface AdminProduct {
    _id: string;
    name: string;
    price: number;
    stock: number;
    isActive: boolean;
    images: string[];
    shop: { _id: string; shopName: string; slug: string } | string;
    category: { _id: string; name: string; slug: string } | string;
    createdAt: string;
}

export interface AdminOrder {
    _id: string;
    orderStatus: string;
    paymentStatus: string;
    grandTotal: number;
    shop: { _id: string; shopName: string; slug: string } | string;
    buyer: { _id: string; name: string; email: string } | string;
    createdAt: string;
}

export interface DashboardStats {
    users: { total: number; buyers: number; sellers: number };
    shops: { total: number; verified: number };
    products: { total: number; active: number };
    orders: { total: number; pending: number; delivered: number; cancelled: number };
    revenue: number;
}

export interface PaginatedUsers {
    users: AdminUser[];
    total: number;
    page: number;
    pages: number;
}
export interface PaginatedShops {
    shops: AdminShop[];
    total: number;
    page: number;
    pages: number;
}
export interface PaginatedAdminProducts {
    products: AdminProduct[];
    total: number;
    page: number;
    pages: number;
}
export interface PaginatedAdminOrders {
    orders: AdminOrder[];
    total: number;
    page: number;
    pages: number;
}

/* =========================================================
   QUERY PARAMS / PAYLOADS
========================================================= */

export interface UserQueryParams {
    role?: UserRole;
    search?: string;
    page?: number;
    limit?: number;
}

export interface ShopQueryParams {
    isVerified?: boolean;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface AdminProductQueryParams {
    shop?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface AdminOrderQueryParams {
    orderStatus?: string;
    paymentStatus?: string;
    shop?: string;
    buyer?: string;
    page?: number;
    limit?: number;
}

export interface UpdateUserRoleArgs {
    id: string;
    role: UserRole;
}

export interface AdminResetPasswordArgs {
    id: string;
    newPassword?: string;
}

export interface AdminResetPasswordResponse {
    message: string;
    userId: string;
    email: string;
    temporaryPassword: string;
}