'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from './api';

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin';
  isVerified: boolean;
}

/** undefined = still loading, null = signed out. */
export function useSession(): SessionUser | null | undefined {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  useEffect(() => {
    apiFetch<{ data: { user: SessionUser } }>('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);
  return user;
}

export async function logoutAndGoHome() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } finally {
    window.location.href = '/';
  }
}
