'use client';

import { useEffect, useState } from 'react';

import { ApartmentCard } from '../../components/apartments/ApartmentCard';
import { AuthNav } from '../../components/layout/AuthNav';
import { apiFetch } from '../../lib/api';
import { useFavorites } from '../../lib/favorites';
import type { ApartmentListItem } from '../../types/apartments';
import { Logo } from '../../components/Logo';

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
    <main className="min-h-screen bg-brand-surface pb-16">
      <header className="border-b border-brand-border bg-white">
        <div className="mx-auto flex w-full max-w-container items-center justify-between px-4 py-4 sm:px-8">
          <Logo />
          <AuthNav />
        </div>
      </header>
      <div className="mx-auto w-full max-w-container px-4 py-8 sm:px-8">
        <h1 className="text-2xl font-bold text-brand-primary">Saved homes</h1>
        {signedOut ? (
          <p className="mt-6 text-brand-muted">
            <a href="/login" className="font-semibold text-brand-accent underline">Log in</a> to see the homes you saved.
          </p>
        ) : shown === null ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-brand-primary-soft" />)}
          </div>
        ) : shown.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-brand-border bg-white p-10 text-center">
            <p className="font-semibold text-brand-ink">Nothing saved yet</p>
            <p className="mt-1 text-sm text-brand-muted">Tap the heart on any home to keep it here.</p>
            <a href="/apartments" className="mt-4 inline-block rounded-lg bg-brand-accent px-5 py-3 font-semibold text-white transition hover:bg-brand-accent-hover">Browse homes</a>
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
