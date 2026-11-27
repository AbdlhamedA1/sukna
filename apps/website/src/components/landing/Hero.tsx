'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from '../../lib/api';
import { HeroSearch } from '../locations/HeroSearch';

export function Hero() {
  const [stats, setStats] = useState<{ homes: number } | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<{ data: { pagination: { total: number } } }>('/apartments?limit=1'),
    ])
      .then(([a]) => {
        setStats({ homes: a.data.pagination.total });
      })
      .catch(() => undefined);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#EAF3F4] via-white to-white">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-teal/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-10 h-96 w-96 rounded-full bg-brand-primary/10 blur-3xl" />
      <div className="relative mx-auto grid w-full max-w-container items-center gap-12 px-4 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-teal/30 bg-white/80 px-4 py-1.5 text-sm font-semibold text-brand-teal shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-brand-teal" /> Qena &middot; Sohag &middot; Minya
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-brand-primary sm:text-5xl lg:text-6xl">
            Student housing you can{' '}
            <span className="bg-gradient-to-r from-brand-teal to-[#2E6FA8] bg-clip-text text-transparent">trust</span> in Upper Egypt.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-brand-muted">
            Browse apartments in verified buildings, see exactly how far they are from campus, and contact owners directly. No middlemen.
          </p>
          <div className="mt-8">
            <HeroSearch />
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4 sm:gap-x-12">
            {[
              [stats ? String(stats.homes) : '-', stats?.homes === 1 ? 'Home listed' : 'Homes listed'],
              ['3', 'Governorates'],
              ['Free', 'To browse'],
            ].map(([n, l]) => (
              <div key={l} className="border-l-2 border-brand-teal/40 pl-4">
                <p className="text-3xl font-extrabold text-brand-primary">{n}</p>
                <p className="text-sm text-brand-muted">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto flex aspect-[4/3] w-full max-w-xl items-center justify-center overflow-hidden rounded-[2.5rem] border border-brand-border bg-gradient-to-br from-white via-[#EEF5F6] to-[#DCEBEE] shadow-2xl lg:aspect-square">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-teal/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-brand-primary/15 blur-3xl" />
          <img src="/logo-h.png" alt="SUKNA" className="relative w-[74%] animate-floaty object-contain drop-shadow-xl" loading="eager" />
        </div>
      </div>
    </section>
  );
}
