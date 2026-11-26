import type { NextFunction, Request, Response } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  errors?: Array<{ field: string; message: string }>;
}

/**
 * Central error handler. Emits the uniform error envelope documented in
 * docs/API_DOCUMENTATION.md (success/message/errors/statusCode).
 */
export function errorHandler(
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? 500;

  if (statusCode >= 500) {
    console.error('[error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? 'Internal server error.' : err.message,
    ...(err.errors ? { errors: err.errors } : {}),
    statusCode,
  });
}

/** Convenience factory for throwing HTTP errors up to the error handler. */
export function httpError(
  statusCode: number,
  message: string,
  errors?: Array<{ field: string; message: string }>,
): ApiError {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  if (errors) error.errors = errors;
  return error;
}
