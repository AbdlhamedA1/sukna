/**
 * Shared API contract types. Filled in per vertical slice
 * (auth, properties, locations, monetization) as documented in
 * docs/API_DOCUMENTATION.md.
 */

/** Uniform success envelope returned by every API endpoint. */
export interface ApiSuccessEnvelope<T> {
  success: true;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Uniform error envelope returned by every API endpoint. */
export interface ApiErrorEnvelope {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
  statusCode: number;
}

export type UserRole = 'user' | 'admin';
