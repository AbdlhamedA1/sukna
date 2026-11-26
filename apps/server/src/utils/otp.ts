import crypto from 'node:crypto';

import { env } from '../config/env.js';
import type { VerificationPurpose } from '../models/VerificationCode.js';

export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 5 * 60 * 1000; // exactly 5 minutes
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

/**
 * Cryptographically secure 6-digit numeric code. padStart preserves
 * leading zeros ("052914" must never become "52914") — FR-AUTH-02.
 */
export function generateOtpCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(OTP_LENGTH, '0');
}

/**
 * HMAC-SHA-256 of the code, keyed with OTP_SECRET and bound to the
 * email + purpose so a code issued for one purpose cannot be replayed
 * against another. Plaintext storage is prohibited — FR-AUTH-03.
 */
export function hashOtpCode(email: string, purpose: VerificationPurpose, code: string): string {
  return crypto
    .createHmac('sha256', env.otpSecret)
    .update(`${email.toLowerCase()}:${purpose}:${code}`)
    .digest('hex');
}

/** Constant-time comparison of a presented code against the stored HMAC. */
export function verifyOtpCode(
  email: string,
  purpose: VerificationPurpose,
  code: string,
  expectedHmac: string,
): boolean {
  const presented = hashOtpCode(email, purpose, code);
  const a = Buffer.from(presented, 'utf8');
  const b = Buffer.from(expectedHmac, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
