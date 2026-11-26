import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * RTK Query base API slice — MANDATORY network layer (ADR-014).
 * Axios is strictly prohibited in apps/dashboard. Every feature endpoint
 * is injected into this slice via apiSlice.injectEndpoints().
 *
 * Session cookies travel via `credentials: 'include'`, and the
 * `X-Requested-With: XMLHttpRequest` header satisfies the backend CSRF
 * defense-in-depth requirement (docs/SECURITY_PLAN.md).
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1',
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('X-Requested-With', 'XMLHttpRequest');
      return headers;
    },
  }),
  tagTypes: ['Auth', 'Building', 'Apartment', 'Location', 'Package', 'Order', 'User', 'Audit'],
  endpoints: () => ({}),
});
