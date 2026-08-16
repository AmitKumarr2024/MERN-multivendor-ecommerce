import { z } from "zod";

const mongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "A valid product id is required");

export const addItemSchema = z.object({
  productId: mongoIdSchema,
});