export interface WishlistProductShop {
    _id: string;
    shopName: string;
    slug: string;
}

/** Populated product as it comes back inside the wishlist — same shape cart uses. */
export interface WishlistProduct {
    _id: string;
    name: string;
    images: string[];
    price: number;
    discountPrice?: number | null;
    stock: number;
    isActive: boolean;
    shop: WishlistProductShop;
}

export interface Wishlist {
    _id: string;
    products: WishlistProduct[];
}

export interface AddToWishlistPayload {
    productId: string;
}

export interface CheckWishlistedResponse {
    productId: string;
    wishlisted: boolean;
}