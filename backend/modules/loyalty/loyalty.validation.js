import { z } from "zod";

const mongoId = (label) =>
  z.string().regex(/^[0-9a-fA-F]{24}$/, `A valid ${label} is required`);

// NOTE: validate() replaces req.params with the parsed data, so each schema
// must list every param its route uses or Zod strips it.
export const shopParams = z.object({ shopId: mongoId("shop id") });
export const shopBuyerParams = z.object({
  shopId: mongoId("shop id"),
  buyerId: mongoId("buyer id"),
});
export const shopRedemptionParams = z.object({
  shopId: mongoId("shop id"),
  id: mongoId("redemption id"),
});

export const programSchema = z.object({
  enabled: z.boolean(),
  pointsPerUnit: z.coerce.number().int().min(1).max(1000),
  spendAmount: z.coerce.number().min(1).max(1000000),
  minRedeemPoints: z.coerce.number().int().min(1).max(1000000),
  rewardValue: z.coerce.number().min(1).max(1000000),
  expiryDays: z.coerce.number().int().min(1).max(3650).nullable().optional(),
});

export const adjustSchema = z.object({
  points: z.coerce
    .number()
    .int()
    .refine((n) => n !== 0, "Points cannot be 0"),
  reason: z.string().trim().min(3, "A reason is required").max(300),
});

export const redeemSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(10).optional(),
});

export const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().trim().max(100).optional(),
  sort: z.enum(["recent", "balance", "earned", "redeemed"]).optional(),
  type: z.enum(["earn", "redeem", "reversal", "expire", "adjust"]).optional(),
  status: z.enum(["issued", "fulfilled"]).optional(),
});

export const topQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
});
