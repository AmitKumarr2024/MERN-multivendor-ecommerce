import { z } from "zod";
import { ROLES } from "../../constants/roles.js";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("A valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().trim().optional(),
  role: z.enum([ROLES.BUYER, ROLES.SELLER]).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("A valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const updateMeSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty").optional(),
  phone: z.string().trim().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const updateRoleSchema = z.object({
  role: z.enum([ROLES.BUYER, ROLES.SELLER]),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("A valid email is required"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});