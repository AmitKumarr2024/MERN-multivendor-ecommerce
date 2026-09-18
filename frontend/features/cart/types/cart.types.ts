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
  /**
   * Whether this product uses variants. When true, `stock` above is
   * irrelevant for this line item - the real availability lives on
   * `CartItem.variant` / is resolved server-side via variantId.
   */
  hasVariants: boolean;
}

/** The specific variant this cart line item points to, as returned by
 *  the backend's buildCartResponse (a trimmed-down shape, not the full
 *  ProductVariant - it only sends what the cart UI needs to display). */
export interface CartItemVariant {
  _id: string;
  color?: string | null;
  size?: string | null;
  images?: string[];
}

export interface CartItem {
  product: CartProduct;
  /** null/undefined for a flat (non-variant) product's cart line. */
  variantId?: string | null;
  /** Populated variant details for display - null when there's no variant. */
  variant?: CartItemVariant | null;
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
  variantId?: string | null;
}

export interface UpdateCartItemArgs {
  productId: string;
  quantity: number;
  variantId?: string | null;
}

export interface RemoveCartItemArgs {
  productId: string;
  variantId?: string | null;
}
