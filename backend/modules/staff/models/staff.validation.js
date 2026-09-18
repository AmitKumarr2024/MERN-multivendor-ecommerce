import { z } from "zod";

export const createStaffSchema = z.object({
  name: z.string().trim().min(1).max(100),
  role: z.string().trim().min(1).max(80),
  bio: z.string().trim().max(500).optional().default(""),
  joiningDate: z.coerce.date(),
});

export const updateStaffSchema = createStaffSchema.partial();

export const staffStatusSchema = z.object({
  isActive: z.boolean(),
});

export const markAttendanceSchema = z.object({
  date: z.coerce.date(),
  status: z.enum(["present", "absent", "leave"]),
  note: z.string().trim().max(200).optional().default(""),
});

export const monthlyAttendanceQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});

export const staffFeedbackSchema = z.object({
  orderId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional().default(""),
});