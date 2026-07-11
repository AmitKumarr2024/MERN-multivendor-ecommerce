import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  description: z.string().trim().optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  discountPrice: z.coerce.number().nonnegative().optional(),
  images: z.array(z.string()).optional(),
  category: z.string().trim().min(1, "Category is required"), // slug, not ObjectId
  stock: z.coerce.number().int().nonnegative().optional(),
  weightKg: z.coerce.number().positive().optional(),
});

// Partial - any subset of fields for a PUT update
export const updateProductSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
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
