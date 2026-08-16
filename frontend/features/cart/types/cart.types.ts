export interface CartProductShop {
    _id: string;
    shopName: string;
    slug: string;
}

/** Populated product as it comes back inside a cart item — a subset of the full Product type. */
export interface CartProduct {
    _id: string;
    name: string;
    images: string[];
    price: number;
    discountPrice?: number | null;
    stock: number;
    isActive: boolean;
    shop: CartProductShop;
}

export interface CartItem {
    product: CartProduct;
    quantity: number;
    /** effectivePrice at the time of fetch — backend computes this, not stored. */
    unitPrice: number;
    subtotal: number;
}

export interface Cart {
    _id: string;
    items: CartItem[];
    cartTotal: number;
}

/* =========================================================
   PAYLOADS
========================================================= */

export interface AddToCartPayload {
    productId: string;
    quantity?: number;
}

export interface UpdateCartItemArgs {
    productId: string;
    quantity: number;
}