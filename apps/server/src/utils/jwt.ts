import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import type { UserRole } from '../models/User.js';

export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 604800 — matches cookie Max-Age

export interface SessionTokenPayload {
  sub: string;
  role: UserRole;
  tokenVersion: number;
}

export interface ResetTokenPayload {
  sub: string;
  email: string;
  type: 'password_reset';
}

/** HS256 session JWT carrying tokenVersion for state-aware revocation. */
export function signSessionToken(payload: SessionTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: SESSION_TTL_SECONDS,
  });
}

export function verifySessionToken(token: string): SessionTokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  if (typeof decoded === 'string') throw new Error('Invalid token payload.');
  return decoded as unknown as SessionTokenPayload;
}

/** Ephemeral 10-minute password-reset ticket (verify-reset-code response). */
export function signResetToken(payload: ResetTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: 10 * 60,
  });
}

export function verifyResetToken(token: string): ResetTokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  if (typeof decoded === 'string') throw new Error('Invalid token payload.');
  const payload = decoded as unknown as ResetTokenPayload;
  if (payload.type !== 'password_reset') throw new Error('Wrong token type.');
  return payload;
}
