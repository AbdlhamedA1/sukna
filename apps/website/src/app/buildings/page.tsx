'use client';

import { useEffect, useState } from 'react';

import { BuildingCard, type BuildingItem } from '../../components/apartments/BuildingCard';
import { AuthNav } from '../../components/layout/AuthNav';
import { apiFetch } from '../../lib/api';
import { Logo } from '../../components/Logo';

export default function BuildingsPage() {
  const [items, setItems] = useState<BuildingItem[] | null>(null);

  useEffect(() => {
    apiFetch<{ data: { buildings: BuildingItem[] } }>('/buildings?limit=50')
      .then((r) => setItems(r.data.buildings))
      .catch(() => setItems([]));
  }, []);

  return (
    <main className="min-h-screen bg-brand-surface pb-16">
      <header className="border-b border-brand-border bg-white">
        <div className="mx-auto flex w-full max-w-container items-center justify-between px-4 py-4 sm:px-8">
          <Logo />
          <AuthNav />
        </div>
      </header>
      <div className="mx-auto w-full max-w-container px-4 py-8 sm:px-8">
        <h1 className="text-2xl font-bold text-brand-primary">Buildings</h1>
        <p className="mt-1 text-brand-muted">Every building we have verified. Open one to see its apartments and area.</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items === null && [0, 1, 2].map((i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-brand-primary-soft" />)}
          {items?.map((b) => <BuildingCard key={b._id} building={b} />)}
        </div>
        {items?.length === 0 && <p className="mt-10 text-center text-brand-muted">No buildings yet.</p>}
      </div>
    </main>
  );
}
