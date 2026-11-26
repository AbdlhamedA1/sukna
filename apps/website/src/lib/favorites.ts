'use client';

import { useCallback, useEffect, useState } from 'react';

import { apiFetch } from './api';

let cache: Set<string> | null = null; // shared per page load
const listeners = new Set<(s: Set<string>) => void>();
let inflight: Promise<void> | null = null;

function publish(next: Set<string>) {
  cache = next;
  listeners.forEach((l) => l(next));
}

function load(): Promise<void> {
  if (!inflight) {
    inflight = apiFetch<{ data: { ids: string[] } }>('/favorites/ids')
      .then((r) => publish(new Set(r.data.ids)))
      .catch(() => publish(new Set())); // signed out: nothing saved
  }
  return inflight;
}

/** Saved-apartment ids for the signed-in user plus a toggle. Signed-out users get redirected to login. */
export function useFavorites() {
  const [ids, setIds] = useState<Set<string>>(cache ?? new Set());
  const [ready, setReady] = useState(cache !== null);

  useEffect(() => {
    listeners.add(setIds);
    void load().then(() => setReady(true));
    return () => {
      listeners.delete(setIds);
    };
  }, []);

  const toggle = useCallback(async (apartmentId: string) => {
    const had = cache?.has(apartmentId) ?? false;
    const next = new Set(cache ?? []);
    if (had) next.delete(apartmentId);
    else next.add(apartmentId);
    publish(next); // optimistic
    try {
      await apiFetch(`/favorites/${apartmentId}`, { method: had ? 'DELETE' : 'POST' });
    } catch {
      const undo = new Set(cache ?? []);
      if (had) undo.add(apartmentId);
      else undo.delete(apartmentId);
      publish(undo);
      if (!had) window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
  }, []);

  return { ids, ready, toggle };
}
