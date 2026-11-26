import type { NextFunction, Request, Response } from 'express';

import { httpError } from './errorHandler.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF defense-in-depth (NFR-SEC-05): state-changing requests must carry
 * the custom header X-Requested-With: XMLHttpRequest. Combined with
 * SameSite=Lax cookies, a cross-site form POST cannot satisfy this.
 */
export function csrfHeaderGuard(req: Request, _res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) return next();
  if (req.get('X-Requested-With') !== 'XMLHttpRequest') {
    return next(httpError(403, 'Missing required X-Requested-With header.'));
  }
  next();
}
