import { z } from "zod";

const specificationSchema = z.object({
  label: z.string().trim().min(1, "Specification label is required"),
  value: z.string().trim().min(1, "Specification value is required"),
});

const variantInputSchema = z.object({
  color: z.string().trim().optional(),
  size: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  price: z.coerce.number().positive().optional(),
  discountPrice: z.coerce.number().nonnegative().optional(),
  stock: z.coerce.number().int().nonnegative(),
  images: z.array(z.string()).optional(),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  description: z.string().trim().optional(),
  specifications: z.array(specificationSchema).optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  discountPrice: z.coerce.number().nonnegative().optional(),
  images: z.array(z.string()).optional(),
  category: z.string().trim().min(1, "Category is required"),
  stock: z.coerce.number().int().nonnegative().optional(),
  weightKg: z.coerce.number().positive().optional(),
  hasVariants: z.boolean().optional(),
  variants: z.array(variantInputSchema).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  specifications: z.array(specificationSchema).optional(),
  price: z.coerce.number().positive().optional(),
  discountPrice: z.coerce.number().nonnegative().optional(),
  images: z.array(z.string()).optional(),
  category: z.string().trim().min(1).optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  weightKg: z.coerce.number().positive().optional(),
  isActive: z.boolean().optional(),
});

export const updateStockSchema = z.object({
  stock: z.coerce
    .number()
    .int()
    .nonnegative("Stock must be a non-negative number"),
});

// 👇 NEW
export const addVariantSchema = variantInputSchema;

export const updateVariantSchema = z.object({
  color: z.string().trim().optional(),
  size: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  price: z.coerce.number().positive().optional(),
  discountPrice: z.coerce.number().nonnegative().optional(),
  stock: z.coerce.number().int().nonnegative().optional(),
  images: z.array(z.string()).optional(),
});
