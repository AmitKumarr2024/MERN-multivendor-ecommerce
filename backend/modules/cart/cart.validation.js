import { z } from "zod";

const mongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "A valid product id is required");

// Same shape as mongoIdSchema but optional/nullable - a variant's _id.
// IMPORTANT: without this field explicitly listed, z.object() silently
// strips `variantId` from req.body before the controller ever sees it
// (Zod drops unrecognized keys by default, unlike Mongoose). That caused
// addItemToCart to always receive variantId as undefined even when the
// frontend was sending it correctly - a completely separate bug from the
// frontend-side variantId wiring issue.
const variantIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "A valid variant id is required")
  .nullable()
  .optional();

export const addItemSchema = z.object({
  productId: mongoIdSchema,
  quantity: z.coerce.number().int().positive().optional(),
  variantId: variantIdSchema,
});

export const updateItemSchema = z.object({
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
  variantId: variantIdSchema,
});
