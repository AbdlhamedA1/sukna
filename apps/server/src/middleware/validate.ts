import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

import { httpError } from './errorHandler.js';

/**
 * Strict request body validation (NFR-SEC-06). Zod schemas use .strict()
 * or .strip() so unexpected attributes never reach the controllers.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      }));
      return next(httpError(400, 'Validation failed.', errors));
    }
    req.body = result.data;
    next();
  };
}

/** Same strict validation for query strings; parsed values replace req.query. */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'query',
        message: issue.message,
      }));
      return next(httpError(400, 'Validation failed.', errors));
    }
    req.query = result.data;
    next();
  };
}
