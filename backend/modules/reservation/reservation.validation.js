import { z } from "zod";

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createReservationSchema = z.object({
  productId: mongoId,
  variantId: mongoId.nullable().optional(),
  quantity: z.coerce.number().int().positive(),
});

export const rejectReservationSchema = z.object({
  rejectionReason: z.string().trim().min(1, "A reason is required").max(300),
});

export const cancelReservationSchema = z.object({
  reason: z.string().trim().max(300).optional(),
});

export const toggleProductReservationSchema = z.object({
  enabled: z.boolean(),
});

export const shopReservationSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  expiryHours: z.coerce.number().int().min(1).max(168).optional(),
  pickupWindowHours: z.coerce.number().int().min(1).max(336).optional(),
  pickupInstructions: z.string().trim().max(500).optional(),
});

export const listReservationsQuerySchema = z.object({
  status: z
    .enum([
      "pending",
      "confirmed",
      "ready",
      "collected",
      "cancelled",
      "expired",
    ])
    .optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
