import { z } from "zod";

/** Reusable password field with full strength validation */
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

/** Registration form schema */
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name cannot exceed 100 characters")
      .regex(/^[a-zA-Z\s'-]+$/, "Full name can only contain letters, spaces, hyphens, and apostrophes"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .max(254, "Email address is too long"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/** Login form schema */
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

/** OTP verification schema */
export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
  userId: z.string().min(1, "User ID is required"),
  type: z.enum(["email-verification", "password-reset"]),
});

/** Forgot password schema */
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

/** Reset password schema */
export const resetPasswordSchema = z
  .object({
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d{6}$/, "OTP must contain only digits"),
    userId: z.string().min(1, "User ID is required"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/** Resend OTP schema */
export const resendOtpSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  type: z.enum(["email-verification", "password-reset"]),
});

/** Change password schema (from dashboard) */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// TypeScript inferred types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
