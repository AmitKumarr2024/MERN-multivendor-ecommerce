import { z } from "zod";

const mongoId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "A valid shop id is required");

export const shopIdParamSchema = z.object({ shopId: mongoId });

export const followedShopsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const customersQuerySchema = z.object({
  segment: z.enum(["all", "new", "returning", "regular"]).optional(),
  search: z.string().trim().max(100).optional(),
  sort: z.enum(["lastOrder", "orders", "spent", "firstOrder"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
