import type { Response } from 'express';

import { env } from '../config/env.js';
import { SESSION_TTL_SECONDS } from './jwt.js';

export const AUTH_COOKIE_NAME = 'sukna_token';

/**
 * Session transport: HttpOnly + SameSite=Lax cookie (docs/SYSTEM_ARCHITECTURE.md §4.2).
 * Secure only in production; Domain is set to the unified apex domain in
 * production so the Website and Dashboard subdomains both carry it.
 */
export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProduction(),
    path: '/',
    maxAge: SESSION_TTL_SECONDS * 1000,
    ...(env.isProduction() ? { domain: '.sukna.com' } : {}),
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProduction(),
    path: '/',
    ...(env.isProduction() ? { domain: '.sukna.com' } : {}),
  });
}
