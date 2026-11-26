import type { NextFunction, Request, Response } from 'express';

import { User } from '../models/User.js';
import { audienceOf, cookieNameFor } from '../utils/cookies.js';
import { verifySessionToken } from '../utils/jwt.js';
import { httpError } from './errorHandler.js';

/**
 * Authentication gate. Verifies the session JWT, then re-checks the live
 * user record: tokenVersion mismatch means the session was revoked
 * (logout / password change / suspension) and is rejected immediately —
 * ADR-017 state-aware revocation.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[cookieNameFor(audienceOf(req))] as string | undefined;
    if (!token) throw httpError(401, 'Authentication required.');

    let payload;
    try {
      payload = verifySessionToken(token);
    } catch {
      throw httpError(401, 'Session expired or invalid.');
    }

    const user = await User.findById(payload.sub).select('role tokenVersion isActive isVerified');
    if (!user) throw httpError(401, 'Account no longer exists.');
    if (user.tokenVersion !== payload.tokenVersion) {
      throw httpError(401, 'Session has been revoked. Please log in again.');
    }
    if (!user.isActive) throw httpError(403, 'Account is deactivated.');
    // Strict role separation: dashboard sessions are admin-only, website sessions user-only.
    const wantsAdmin = audienceOf(req) === 'dashboard';
    if ((user.role === 'admin') !== wantsAdmin) {
      throw httpError(403, 'This account cannot be used here.');
    }

    req.user = {
      id: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
      isVerified: user.isVerified,
    };
    next();
  } catch (error) {
    next(error);
  }
}

/** RBAC gate: admin-only routes return 403 for regular users. */
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(httpError(401, 'Authentication required.'));
  if (req.user.role !== 'admin') return next(httpError(403, 'Administrator access required.'));
  next();
}

/** Verified-email gate for sensitive disclosures (e.g. landlord contact). */
export function requireVerified(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(httpError(401, 'Authentication required.'));
  if (!req.user.isVerified) return next(httpError(403, 'Email verification required.'));
  next();
}
