'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from '../../lib/api';
import { formatDistance } from '../../lib/geo';

interface Area {
  hasLocation: boolean;
  radiusMeters?: number;
  landmarks: { name: string; meters: number; walkMinutes: number }[];
  services: { counts: Record<string, number>; level: 'well_served' | 'some' | 'far' } | null;
}

const LEVEL = {
  well_served: { label: 'Well served', cls: 'bg-emerald-100 text-emerald-800' },
  some: { label: 'Some services nearby', cls: 'bg-amber-100 text-amber-800' },
  far: { label: 'Far from services', cls: 'bg-rose-100 text-rose-800' },
} as const;

const LABEL: Record<string, string> = {
  grocery: 'Groceries',
  pharmacy: 'Pharmacy',
  health: 'Clinics',
  food: 'Food and cafes',
  money: 'Bank or ATM',
  transport: 'Bus stops',
};

export function AreaInfo({ buildingId }: { buildingId: string }) {
  const [area, setArea] = useState<Area | null | undefined>(undefined);

  useEffect(() => {
    apiFetch<{ data: Area }>(`/buildings/${buildingId}/area`)
      .then((r) => setArea(r.data))
      .catch(() => setArea(null));
  }, [buildingId]);

  if (area === undefined) {
    return <div className="h-40 animate-pulse rounded-2xl bg-brand-primary-soft" />;
  }
  if (!area || !area.hasLocation || (area.landmarks.length === 0 && !area.services)) return null;

  const lvl = area.services ? LEVEL[area.services.level] : null;
  return (
    <div className="rounded-2xl border border-brand-border bg-white p-5">
      <h2 className="font-bold text-brand-primary">Around this building</h2>

      {area.landmarks.length > 0 && (
        <ul className="mt-3 space-y-2 text-sm">
          {area.landmarks.map((l) => (
            <li key={l.name} className="flex items-start justify-between gap-3">
              <span className="text-brand-ink">{l.name}</span>
              <span className="shrink-0 font-semibold text-brand-primary">
                {formatDistance(l.meters)} <span className="font-normal text-brand-muted">(about {l.walkMinutes} min walk)</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {area.services && lvl && (
        <div className="mt-4 border-t border-brand-border pt-4">
          <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${lvl.cls}`}>{lvl.label}</span>
          <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-brand-muted">
            {Object.entries(LABEL).map(([k, name]) => (
              <li key={k} className={area.services!.counts[k] ? 'text-brand-ink' : ''}>
                {area.services!.counts[k] ? '\u2713' : '\u2013'} {name}
                {area.services!.counts[k] ? ` (${area.services!.counts[k]})` : ''}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-brand-muted">
            Within {area.radiusMeters} m. Distances are straight-line. Services come from OpenStreetMap and may miss small shops.
          </p>
        </div>
      )}
    </div>
  );
}
