import { z } from "zod";

const shippingAddressSchema = z.object({
  fullName: z.string().trim().optional(),
  phone: z.string().trim().min(1, "Phone is required"),
  street: z.string().trim().min(1, "Street is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

export const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(["cod", "razorpay"]).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
});

export const cancelOrderSchema = z.object({
  reason: z.string().trim().optional(),
});
