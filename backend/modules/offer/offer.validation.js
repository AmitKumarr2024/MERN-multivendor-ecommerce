import { z } from "zod";

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const baseOfferSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(20)
    .regex(/^[A-Za-z0-9_-]+$/, "Code can only contain letters, numbers, - and _"),
  description: z.string().trim().max(300).optional(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().positive(),
  minOrderValue: z.coerce.number().nonnegative().optional(),
  maxDiscountAmount: z.coerce.number().positive().optional(),
  scope: z.enum(["shop", "category", "product"]).optional(),
  applicableProducts: z.array(mongoId).optional(),
  applicableCategories: z.array(mongoId).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  usageLimit: z.coerce.number().int().positive().optional(),
  perCustomerLimit: z.coerce.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

const withSharedRules = (schema) =>
  schema
    .refine((d) => d.discountType !== "percentage" || d.discountValue === undefined || d.discountValue <= 100, {
      message: "Percentage discount cannot exceed 100",
      path: ["discountValue"],
    })
    .refine((d) => !(d.startDate && d.endDate) || d.endDate > d.startDate, {
      message: "End date must be after start date",
      path: ["endDate"],
    })
    .refine(
      (d) => d.scope !== "product" || (d.applicableProducts && d.applicableProducts.length > 0),
      { message: "At least one product is required for a product-specific offer", path: ["applicableProducts"] },
    )
    .refine(
      (d) => d.scope !== "category" || (d.applicableCategories && d.applicableCategories.length > 0),
      { message: "At least one category is required for a category-specific offer", path: ["applicableCategories"] },
    );

export const createOfferSchema = withSharedRules(baseOfferSchema);
export const updateOfferSchema = withSharedRules(baseOfferSchema.partial());

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1, "A coupon code is required"),
});