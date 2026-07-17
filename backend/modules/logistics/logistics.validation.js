import { z } from "zod";

export const checkServiceabilitySchema = z.object({
  shopId: z.string().regex(/^[0-9a-fA-F]{24}$/, "A valid shopId is required"),
  deliveryPincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Pincode must be 6 digits"),
  weightKg: z.coerce.number().positive().optional(),
});

// Webhook payload shape varies by provider and isn't something we control -
// only check it's a non-empty object, real validation happens field-by-field
// inside logistics.service.js's handleShipmentWebhook.
export const webhookSchema = z.record(z.string(), z.unknown());
