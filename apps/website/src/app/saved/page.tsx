'use client';

import { useEffect, useState } from 'react';

import { ApartmentCard } from '../../components/apartments/ApartmentCard';
import { apiFetch } from '../../lib/api';
import { useFavorites } from '../../lib/favorites';
import type { ApartmentListItem } from '../../types/apartments';

export default function SavedPage() {
  const [items, setItems] = useState<ApartmentListItem[] | null>(null);
  const [signedOut, setSignedOut] = useState(false);
  const { ids, ready } = useFavorites();

  useEffect(() => {
    apiFetch<{ data: { apartments: ApartmentListItem[] } }>('/favorites')
      .then((r) => setItems(r.data.apartments))
      .catch(() => setSignedOut(true));
  }, []);

  const shown = items && ready ? items.filter((a) => ids.has(a._id)) : null;

  return (
    <main className="min-h-screen bg-brand-canvas pb-16">
      <div className="mx-auto w-full max-w-container px-4 py-10 sm:px-8">
        <h1 className="text-2xl font-extrabold text-brand-primary sm:text-3xl">Favorites</h1>
        {signedOut ? (
          <p className="mt-6 text-brand-muted">
            <a href="/login" className="font-semibold text-brand-accent underline">Log in</a> to see the homes you saved.
          </p>
        ) : shown === null ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-3xl bg-brand-primary-soft" />)}
          </div>
        ) : shown.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-brand-border bg-white p-12 text-center">
            <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden fill="none" stroke="#3C8F86" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <p className="mt-4 font-semibold text-brand-ink">Nothing saved yet</p>
            <p className="mt-1 text-sm text-brand-muted">Tap the heart on any home to keep it here.</p>
            <a href="/apartments" className="mt-5 inline-flex h-12 items-center rounded-xl bg-brand-accent px-6 font-semibold text-white transition hover:bg-brand-accent-hover">Browse homes</a>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((a) => <ApartmentCard key={a._id} apartment={a} />)}
          </div>
        )}
      </div>
    </main>
  );
}
