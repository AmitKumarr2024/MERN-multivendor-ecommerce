import type {
  Product,
  ProductCategory,
  ProductShop,
  ProductVariant,
} from "../types/product.types";

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getShopInfo(product: Product): ProductShop | null {
  return typeof product.shop === "string" ? null : product.shop;
}

export function getCategoryInfo(product: Product): ProductCategory | null {
  return typeof product.category === "string" ? null : product.category;
}

export function resolveEffectivePrice(product: Product): number {
  if (typeof product.effectivePrice === "number") return product.effectivePrice;
  if (product.discountPrice && product.discountPrice < product.price) {
    return product.discountPrice;
  }
  return product.price;
}

export function resolveDiscountPercent(product: Product): number {
  if (typeof product.discountPercent === "number")
    return product.discountPercent;
  if (product.discountPrice && product.discountPrice < product.price) {
    return Math.round(
      ((product.price - product.discountPrice) / product.price) * 100,
    );
  }
  return 0;
}

// 👇 NEW — variant-aware price resolver, mirrors backend getEffectivePriceForVariant
export function resolveVariantPrice(
  product: Product,
  variant: ProductVariant | null,
): number {
  if (variant) {
    if (variant.discountPrice != null) return variant.discountPrice;
    if (variant.price != null) return variant.price;
  }
  return resolveEffectivePrice(product);
}

// 👇 NEW — total stock across variants, or flat stock
export function resolveTotalStock(product: Product): number {
  if (!product.hasVariants || !product.variants?.length) return product.stock;
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

// 👇 NEW — original (strikethrough) price for the currently selected variant,
// falling back to the base product price when the variant has no override
export function resolveVariantOriginalPrice(
  product: Product,
  variant: ProductVariant | null,
): number {
  if (variant && variant.price != null) return variant.price;
  return product.price;
}

// 👇 NEW — variant-aware discount % (mirrors resolveVariantPrice's fallback
// logic). Fixes the bug where the base product's discount% (e.g. 12%) was
// shown even when a variant's own price/discountPrice implied a different
// discount (e.g. 75 -> 70 is ~7%, not 12%).
export function resolveVariantDiscountPercent(
  product: Product,
  variant: ProductVariant | null,
): number {
  const original = resolveVariantOriginalPrice(product, variant);
  const effective = resolveVariantPrice(product, variant);

  if (effective < original) {
    return Math.round(((original - effective) / original) * 100);
  }
  return 0;
}
