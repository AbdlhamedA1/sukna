import { Router } from 'express';

import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { csrfHeaderGuard } from '../middleware/csrf.js';
import { authRateLimiter } from '../middleware/rateLimit.js';
import { validateBody } from '../middleware/validate.js';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  verifyResetCodeSchema,
} from '../validators/auth.validators.js';

export const authRouter = Router();

authRouter.use(authRateLimiter);

// Public flows
authRouter.post(
  '/register',
  csrfHeaderGuard,
  validateBody(registerSchema),
  authController.register,
);
authRouter.post(
  '/verify-email',
  csrfHeaderGuard,
  validateBody(verifyEmailSchema),
  authController.verifyEmail,
);
authRouter.post(
  '/resend-verification',
  csrfHeaderGuard,
  validateBody(resendVerificationSchema),
  authController.resendVerification,
);
authRouter.post('/login', csrfHeaderGuard, validateBody(loginSchema), authController.login);
authRouter.post(
  '/forgot-password',
  csrfHeaderGuard,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword,
);
authRouter.post(
  '/verify-reset-code',
  csrfHeaderGuard,
  validateBody(verifyResetCodeSchema),
  authController.verifyResetCode,
);
authRouter.post(
  '/reset-password',
  csrfHeaderGuard,
  validateBody(resetPasswordSchema),
  authController.resetPassword,
);

// Authenticated flows
authRouter.post('/logout', csrfHeaderGuard, requireAuth, authController.logout);
authRouter.get('/me', requireAuth, authController.me);
authRouter.post(
  '/change-password',
  csrfHeaderGuard,
  requireAuth,
  validateBody(changePasswordSchema),
  authController.changePassword,
);
