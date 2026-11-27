'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from '../../lib/api';
import { Reveal } from './Reveal';

interface BuildingItem {
  _id: string;
  name: string;
  mainImage: string;
  streetAddress: string;
  governorateId?: { nameEn: string };
  cityId?: { nameEn: string };
  areaId?: { nameEn: string };
}

function BuildingTile({ building }: { building: BuildingItem }) {
  const place = [building.areaId?.nameEn, building.cityId?.nameEn, building.governorateId?.nameEn].filter(Boolean).join(', ');
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm">
      <div className="aspect-[4/3] w-full overflow-hidden bg-brand-surface">
        <img src={building.mainImage} alt={building.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-col gap-1 p-4">
        <h3 className="line-clamp-1 text-lg font-bold text-brand-primary">{building.name}</h3>
        <p className="line-clamp-1 text-sm text-brand-muted">{building.streetAddress}</p>
        {place ? <p className="line-clamp-1 text-xs text-brand-muted">{place}</p> : null}
      </div>
    </div>
  );
}

export function BuildingsStrip() {
  const [items, setItems] = useState<BuildingItem[] | null>(null);
  useEffect(() => {
    const load = () =>
  apiFetch<{ data: { buildings: BuildingItem[] } }>('/buildings?limit=6')
        .then((r) => setItems(r.data.buildings))
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
  if (items && items.length === 0) return null;
  return (
    <section id="buildings" className="bg-brand-canvas py-16 sm:py-24">
      <div className="mx-auto w-full max-w-container px-4 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-teal">Buildings</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-brand-primary sm:text-4xl">Newest buildings</h2>
          </div>

        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items === null && [0, 1, 2].map((i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-white" />)}
          {items?.map((b, i) => (
            <Reveal key={b._id} delay={i * 70}><BuildingTile building={b} /></Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
