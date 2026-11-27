'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from '../../lib/api';
import { HeroSearch } from '../locations/HeroSearch';

interface B { _id: string; name: string; mainImage: string; streetAddress: string }

export function Hero() {
  const [buildings, setBuildings] = useState<B[]>([]);
  const [stats, setStats] = useState<{ buildings: number; homes: number } | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<{ data: { buildings: B[]; pagination: { total: number } } }>('/buildings?limit=3'),
      apiFetch<{ data: { pagination: { total: number } } }>('/apartments?limit=1'),
    ])
      .then(([b, a]) => {
        setBuildings(b.data.buildings);
        setStats({ buildings: b.data.pagination.total, homes: a.data.pagination.total });
      })
      .catch(() => undefined);
  }, []);

  const [a, b, c] = buildings;
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
          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            {[
              [stats ? String(stats.buildings) : '-', 'Verified buildings'],
              [stats ? String(stats.homes) : '-', 'Homes listed'],
              ['3', 'Governorates'],
            ].map(([n, l]) => (
              <div key={l}>
                <p className="text-3xl font-extrabold text-brand-primary">{n}</p>
                <p className="text-sm text-brand-muted">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto hidden h-[520px] w-full max-w-xl lg:block">
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-brand-primary to-[#1E5A7A] opacity-95" />
          {[a, b, c].map((x, i) =>
            x ? (
              <a
                key={x._id}
                href={`/buildings/${x._id}`}
                className={`absolute block overflow-hidden rounded-3xl border-4 border-white shadow-2xl transition hover:scale-[1.03] ${
                  i === 0 ? 'left-6 top-8 h-72 w-64 animate-floaty' : i === 1 ? 'right-6 top-24 h-64 w-60 animate-floaty [animation-delay:1.5s]' : 'bottom-8 left-24 h-52 w-72 animate-floaty [animation-delay:3s]'
                }`}
              >
                <img src={x.mainImage} alt={x.name} className="h-full w-full object-cover" loading="eager" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-sm font-semibold text-white">{x.name}</span>
              </a>
            ) : null,
          )}
          {!a && <div className="absolute inset-0 flex items-center justify-center"><img src="/logo-h-white.png" alt="" className="h-20 w-auto opacity-90" /></div>}
          <div className="absolute -left-4 bottom-24 rounded-2xl bg-white px-4 py-3 shadow-xl">
            <p className="text-xs text-brand-muted">Every building</p>
            <p className="font-bold text-brand-primary">Reviewed by our team</p>
          </div>
        </div>
      </div>
    </section>
  );
}
