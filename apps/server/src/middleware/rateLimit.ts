import rateLimit from 'express-rate-limit';

/**
 * Brute-force protection on authentication endpoints. Deliberately strict:
 * OTP verification and login are high-value targets (docs/SECURITY_PLAN.md).
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please try again later.',
    statusCode: 429,
  },
});
