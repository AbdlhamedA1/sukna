'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from '../../lib/api';
import type { ApartmentListItem } from '../../types/apartments';
import { ApartmentCard } from '../apartments/ApartmentCard';
import { Reveal } from './Reveal';

interface ListResponse {
  data: { apartments: ApartmentListItem[]; pagination: { total: number } };
}

export function FeaturedHomes() {
  const [items, setItems] = useState<ApartmentListItem[] | null>(null);

  useEffect(() => {
    const load = () =>
  apiFetch<ListResponse>('/apartments?limit=6&sortBy=newest')
        .then((res) => setItems(res.data.apartments))
        .catch(() => setItems([]));
    load();
    const onVis = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVis);
    const t = setInterval(load, 30000);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      clearInterval(t);
    };
  }, []);

  return (
    <section id="homes" className="bg-white py-16 sm:py-24">
      <div className="mx-auto w-full max-w-container px-4 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-teal">Just added</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-brand-primary sm:text-4xl">Latest homes</h2>
          </div>
          <a href="/apartments" className="rounded-full border border-brand-border bg-white px-5 py-2 text-sm font-semibold text-brand-primary shadow-sm transition hover:shadow-md">
            Browse all homes &rarr;
          </a>
        </Reveal>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items === null &&
            [0, 1, 2].map((i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-brand-surface" />
            ))}
          {items?.map((a, i) => (
            <Reveal key={a._id} delay={i * 60}><ApartmentCard apartment={a} /></Reveal>
          ))}
        </div>
        {items?.length === 0 && (
          <p className="mt-8 text-center text-brand-muted">New homes are added here as soon as they are published.</p>
        )}
      </div>
    </section>
  );
}
