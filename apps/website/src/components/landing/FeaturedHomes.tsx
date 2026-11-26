'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from '../../lib/api';
import type { ApartmentListItem } from '../../types/apartments';
import { ApartmentCard } from '../apartments/ApartmentCard';

interface ListResponse {
  data: { apartments: ApartmentListItem[]; pagination: { total: number } };
}

export function FeaturedHomes() {
  const [items, setItems] = useState<ApartmentListItem[] | null>(null);

  useEffect(() => {
    apiFetch<ListResponse>('/apartments?limit=6&sortBy=newest')
      .then((res) => setItems(res.data.apartments))
      .catch(() => setItems([]));
  }, []);

  return (
    <section id="homes" className="bg-white py-16 sm:py-20">
      <div className="mx-auto w-full max-w-container px-4 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-brand-primary sm:text-3xl">Latest homes</h2>
            <p className="mt-2 text-brand-muted">Fresh listings from buildings we have verified.</p>
          </div>
          <a
            href="/apartments"
            className="rounded-lg border border-brand-border px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary-soft"
          >
            Browse all homes
          </a>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items === null &&
            [0, 1, 2].map((i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-brand-surface" />
            ))}
          {items?.map((a) => <ApartmentCard key={a._id} apartment={a} />)}
        </div>
        {items?.length === 0 && (
          <p className="mt-8 text-center text-brand-muted">New listings are on their way.</p>
        )}
      </div>
    </section>
  );
}
