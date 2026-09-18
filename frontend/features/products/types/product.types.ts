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

// 👇 NEW
export interface ProductVariant {
  _id: string;
  color?: string | null;
  size?: string | null;
  sku?: string | null;
  price?: number | null;
  discountPrice?: number | null;
  stock: number;
  images?: string[];
}

// 👇 NEW
export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  _id: string;
  shop: ProductShop | string;
  name: string;
  description?: string;
  specifications?: ProductSpecification[]; // 👈 NEW
  price: number;
  discountPrice?: number | null;
  images: string[];
  category: ProductCategory | string;
  stock: number;
  hasVariants?: boolean; // 👈 NEW
  variants?: ProductVariant[]; // 👈 NEW
  averageRating?: number; // 👈 NEW
  reviewCount?: number; // 👈 NEW
  isActive: boolean;
  weightKg: number;

  effectivePrice?: number;
  discountPercent?: number;

  createdAt: string;
  updatedAt: string;
}

export type ProductSort =
  | "newest"
  | "oldest"
  | "price_low_to_high"
  | "price_high_to_low"
  | "name_a_to_z";

export interface ProductQueryParams {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}

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

export interface CreateProductPayload {
  name: string;
  description?: string;
  specifications?: ProductSpecification[]; // 👈 NEW
  price: number;
  discountPrice?: number;
  images?: string[];
  category: string;
  stock?: number;
  weightKg?: number;
  hasVariants?: boolean; // 👈 NEW
  variants?: Omit<ProductVariant, "_id">[]; // 👈 NEW — no _id on create, server assigns it
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

// 👇 NEW — variant CRUD payloads
export interface AddVariantArgs {
  productId: string;
  variant: Omit<ProductVariant, "_id">;
}

export interface UpdateVariantArgs {
  productId: string;
  variantId: string;
  changes: Partial<Omit<ProductVariant, "_id">>;
}

export interface DeleteVariantArgs {
  productId: string;
  variantId: string;
}
