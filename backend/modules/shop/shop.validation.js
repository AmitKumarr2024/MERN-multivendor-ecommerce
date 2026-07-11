import { z } from "zod";

const slugValue = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z0-9-]+$/,
    "Shop URL can only contain lowercase letters, numbers, and hyphens",
  )
  .optional();

const addressSchema = z
  .object({
    street: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    pincode: z.string().trim().optional(),
    country: z.string().trim().optional(),
  })
  .optional();

export const createShopSchema = z.object({
  shopName: z.string().trim().min(1, "Shop name is required"),
  slug: slugValue,
  description: z.string().trim().optional(),
  logo: z.string().trim().optional(),
  banner: z.string().trim().optional(),
  address: addressSchema,
  contactPhone: z.string().trim().optional(),
  contactEmail: z
    .string()
    .trim()
    .email("Contact email must be valid")
    .optional()
    .or(z.literal("")),
});

export const updateShopSchema = z.object({
  shopName: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  logo: z.string().trim().optional(),
  banner: z.string().trim().optional(),
  address: addressSchema,
  contactPhone: z.string().trim().optional(),
  contactEmail: z
    .string()
    .trim()
    .email("Contact email must be valid")
    .optional()
    .or(z.literal("")),
});

export const updateSlugSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "New shop URL is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Shop URL can only contain lowercase letters, numbers, and hyphens",
    ),
});

// Deliberately loose - the detailed per-day time/format rules already live
// in services/shopHours.service.js (single source of truth for that logic).
// This just ensures the body is a non-empty object of day-keyed entries.
export const businessHoursSchema = z
  .record(z.string(), z.object({}).passthrough())
  .refine((val) => Object.keys(val).length > 0, {
    message: "Provide at least one day's hours to update",
  });

export const holidaySchema = z.object({
  action: z.enum(["add", "remove"]),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});
