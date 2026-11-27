const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

/**
 * Thin fetch helper for the Express backend. Session cookies are forwarded
 * with `credentials: 'include'` and the X-Requested-With header satisfies
 * the backend CSRF defense-in-depth requirement.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status} ${response.statusText}`;
    try {
      const body = (await response.json()) as {
        message?: string;
        errors?: { field?: string; message: string }[];
      };
      if (body?.errors?.length) {
        message = [...new Set(body.errors.map((e) => e.message))].join(' ');
      } else if (body?.message) {
        message = body.message;
      }
    } catch {
      /* keep default message */
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}
