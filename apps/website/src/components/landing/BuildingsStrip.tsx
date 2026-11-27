'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from '../../lib/api';
import { BuildingCard, type BuildingItem } from '../apartments/BuildingCard';
import { Reveal } from './Reveal';

export function BuildingsStrip() {
  const [items, setItems] = useState<BuildingItem[] | null>(null);
  useEffect(() => {
    apiFetch<{ data: { buildings: BuildingItem[] } }>('/buildings?limit=6')
      .then((r) => setItems(r.data.buildings))
      .catch(() => setItems([]));
  }, []);
  if (items && items.length === 0) return null;
  return (
    <section id="buildings" className="bg-brand-canvas py-16 sm:py-24">
      <div className="mx-auto w-full max-w-container px-4 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-teal">Buildings</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-brand-primary sm:text-4xl">Verified buildings</h2>
          </div>
          <a href="/buildings" className="rounded-full border border-brand-border bg-white px-5 py-2 text-sm font-semibold text-brand-primary shadow-sm transition hover:shadow-md">
            All buildings &rarr;
          </a>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items === null && [0, 1, 2].map((i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-white" />)}
          {items?.map((b, i) => (
            <Reveal key={b._id} delay={i * 70}><BuildingCard building={b} /></Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
