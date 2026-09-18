import { z } from "zod";

export const applyKhataSchema = z.object({
  requestNote: z.string().trim().max(300).optional(),
});

export const approveKhataSchema = z.object({
  creditLimit: z.number().positive("Credit limit must be greater than 0"),
});

export const rejectKhataSchema = z.object({
  rejectionReason: z.string().trim().min(1).max(300),
});

export const suspendKhataSchema = z.object({
  suspendedReason: z.string().trim().min(1).max(300),
});

export const updateCreditLimitSchema = z.object({
  creditLimit: z.number().positive(),
});

export const recordPaymentSchema = z.object({
  amount: z.number().positive("Payment amount must be greater than 0"),
  note: z.string().trim().max(300).optional(),
});

export const monthlyStatementQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "month must be YYYY-MM"),
});

export const closeMonthSchema = z.object({
  statementMonth: z.string().regex(/^\d{4}-\d{2}$/),
});
