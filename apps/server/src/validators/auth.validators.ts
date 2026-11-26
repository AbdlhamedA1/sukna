import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Invalid email format.');

// FR-AUTH-01: min 8 chars with at least one uppercase, one lowercase, one number.
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .regex(/[a-z]/, 'Password must contain a lowercase letter.')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
  .regex(/[0-9]/, 'Password must contain a number.');

// Exactly 6 numeric digits as a string — leading zeros preserved.
const otpCode = z.string().regex(/^\d{6}$/, 'Code must be exactly 6 digits.');

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(3).max(100),
    email,
    password,
    confirmPassword: z.string(),
    // Public registration unconditionally provisions role: 'user'.
    // Any role field is stripped here and never reaches the controller.
  })
  .strip()
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export const verifyEmailSchema = z.object({ email, code: otpCode }).strip();

export const resendVerificationSchema = z.object({ email }).strip();

export const loginSchema = z
  .object({
    email,
    password: z.string().min(1, 'Password is required.'),
  })
  .strip();

export const forgotPasswordSchema = z.object({ email }).strip();

export const verifyResetCodeSchema = z.object({ email, code: otpCode }).strip();

export const resetPasswordSchema = z
  .object({
    email,
    resetToken: z.string().min(1),
    newPassword: password,
    confirmNewPassword: z.string(),
  })
  .strip()
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'Passwords do not match.',
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: password,
    confirmNewPassword: z.string(),
  })
  .strip()
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'Passwords do not match.',
  });
