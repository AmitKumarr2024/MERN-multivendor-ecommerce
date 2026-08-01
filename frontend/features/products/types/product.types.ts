/* =========================================================
   SHARED SUB-TYPES
   (populated refs come back as objects; unpopulated as ids)
========================================================= */

export interface ProductCategory {
    _id: string;
    name: string;
    slug: string;
}

export interface ProductShop {
    _id: string;
    shopName: string;
    slug: string;
    logo?: string;
}

/* =========================================================
   CORE PRODUCT
   Matches backend/modules/product/models/product.model.js
========================================================= */

export interface Product {
    _id: string;
    shop: ProductShop | string;
    name: string;
    description?: string;
    price: number;
    discountPrice?: number | null;
    images: string[];
    category: ProductCategory | string;
    stock: number;
    isActive: boolean;
    weightKg: number;

    // Only present on GET /api/products/:id — attached by
    // pricing.service.js, not stored on the document itself.
    effectivePrice?: number;
    discountPercent?: number;

    createdAt: string;
    updatedAt: string;
}

/* =========================================================
   SORT OPTIONS
   Must match SORT_OPTIONS keys in product.read.controller.js
========================================================= */

export type ProductSort =
    | "newest"
    | "oldest"
    | "price_low_to_high"
    | "price_high_to_low"
    | "name_a_to_z";

/* =========================================================
   QUERY PARAMS
   GET /api/products?category=&search=&minPrice=&maxPrice=&sort=&page=&limit=
========================================================= */

export interface ProductQueryParams {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: ProductSort;
    page?: number;
    limit?: number;
}

/* =========================================================
   API RESPONSE SHAPES
========================================================= */

export interface GetAllProductsResponse {
    products: Product[];
    total: number;
    page: number;
    pages: number;
    sort: ProductSort;
}

export interface GetProductsByShopSlugResponse {
    shop: ProductShop;
    products: Product[];
}

export interface MessageResponse {
    message: string;
}

export interface UpdateStockResponse {
    _id: string;
    stock: number;
    isLowStock: boolean;
    isOutOfStock: boolean;
}

export interface ToggleActiveResponse {
    _id: string;
    isActive: boolean;
}

/* =========================================================
   MUTATION PAYLOADS
   Mirrors backend/modules/product/product.validation.js
========================================================= */

export interface CreateProductPayload {
    name: string;
    description?: string;
    price: number;
    discountPrice?: number;
    images?: string[];
    /** Category SLUG, not ObjectId — matches backend convention. */
    category: string;
    stock?: number;
    weightKg?: number;
}

export type UpdateProductPayload = Partial<CreateProductPayload> & {
    isActive?: boolean;
};

export interface UpdateProductArgs {
    id: string;
    data: UpdateProductPayload;
}

export interface UpdateStockArgs {
    id: string;
    stock: number;
}