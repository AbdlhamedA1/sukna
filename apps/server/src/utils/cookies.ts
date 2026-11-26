import type { Request, Response } from 'express';

import { env } from '../config/env.js';
import { SESSION_TTL_SECONDS } from './jwt.js';

export const AUTH_COOKIE_NAME = 'sukna_token';
export const ADMIN_COOKIE_NAME = 'sukna_admin_token';

export type Audience = 'website' | 'dashboard';

/**
 * Which front end is calling, derived from the browser-set Origin header.
 * Website and Dashboard keep separate session cookies so a regular user
 * and an admin can never cross over between the two sides.
 */
export function audienceOf(req: Request): Audience {
  const origin = req.get('Origin');
  return origin && origin === env.dashboardUrl ? 'dashboard' : 'website';
}

export function cookieNameFor(audience: Audience): string {
  return audience === 'dashboard' ? ADMIN_COOKIE_NAME : AUTH_COOKIE_NAME;
}

/**
 * Session transport: HttpOnly + SameSite=Lax cookie (docs/SYSTEM_ARCHITECTURE.md §4.2).
 * Secure only in production; Domain is set to the unified apex domain in
 * production so the Website and Dashboard subdomains both carry it.
 */
export function setAuthCookie(res: Response, token: string, audience: Audience = 'website'): void {
  res.cookie(cookieNameFor(audience), token, {
    httpOnly: true,
    // Cross-site frontends (staging on separate domains) need SameSite=None.
    sameSite: env.isProduction() ? 'none' : 'lax',
    secure: env.isProduction(),
    path: '/',
    maxAge: SESSION_TTL_SECONDS * 1000,
    ...(env.cookieDomain ? { domain: env.cookieDomain } : {}),
  });
}

export function clearAuthCookie(res: Response, audience: Audience = 'website'): void {
  res.clearCookie(cookieNameFor(audience), {
    httpOnly: true,
    sameSite: env.isProduction() ? 'none' : 'lax',
    secure: env.isProduction(),
    path: '/',
    ...(env.cookieDomain ? { domain: env.cookieDomain } : {}),
  });
}
