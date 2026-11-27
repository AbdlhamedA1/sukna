'use client';

import { useEffect, useMemo, useState } from 'react';

import { apiFetch } from '../../lib/api';

export interface LocationNode {
  id: string;
  nameAr: string;
  nameEn: string;
  type: 'governorate' | 'city' | 'area';
  children: LocationNode[];
}

export interface LocationSelection {
  governorateId?: string;
  cityId?: string;
  areaId?: string;
}

interface LocationCascadeProps {
  onChange: (selection: LocationSelection) => void;
  className?: string;
  initial?: LocationSelection;
}

const selectClass =
  'h-12 w-full rounded-lg border border-brand-border bg-white px-3 text-brand-ink outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30 disabled:opacity-50';

/**
 * Cascaded Governorate -> City -> Area selectors fed by GET /locations/tree.
 * Each tier unlocks once its parent is chosen; changing a parent resets the
 * tiers below it.
 */
export function LocationCascade({ onChange, className, initial }: LocationCascadeProps) {
  const [tree, setTree] = useState<LocationNode[]>([]);
  const [governorateId, setGovernorateId] = useState(initial?.governorateId ?? '');
  const [cityId, setCityId] = useState(initial?.cityId ?? '');
  const [areaId, setAreaId] = useState(initial?.areaId ?? '');

  useEffect(() => {
    apiFetch<{ data: { tree: LocationNode[] } }>('/locations/tree')
      .then((res) => setTree(res.data.tree))
      .catch(() => setTree([]));
  }, []);

  const cities = useMemo(
    () => tree.find((g) => g.id === governorateId)?.children ?? [],
    [tree, governorateId],
  );
  const areas = useMemo(
    () => cities.find((c) => c.id === cityId)?.children ?? [],
    [cities, cityId],
  );

  return (
    <div className={`grid grid-cols-1 gap-3 sm:grid-cols-3 ${className ?? ''}`}>
      <select
        aria-label="Governorate"
        className={selectClass}
        value={governorateId}
        onChange={(e) => {
          setGovernorateId(e.target.value);
          setCityId('');
          setAreaId('');
          onChange({ governorateId: e.target.value || undefined });
        }}
      >
        <option value="">Governorate</option>
        {tree.map((g) => (
          <option key={g.id} value={g.id}>
            {g.nameEn}
          </option>
        ))}
      </select>

      <select
        aria-label="City"
        className={selectClass}
        value={cityId}
        disabled={!governorateId}
        onChange={(e) => {
          setCityId(e.target.value);
          setAreaId('');
          onChange({ governorateId, cityId: e.target.value || undefined });
        }}
      >
        <option value="">City</option>
        {cities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nameEn}
          </option>
        ))}
      </select>

      <select
        aria-label="Area"
        className={selectClass}
        value={areaId}
        disabled={!cityId || areas.length === 0}
        onChange={(e) => {
          setAreaId(e.target.value);
          onChange({ governorateId, cityId, areaId: e.target.value || undefined });
        }}
      >
        <option value="">Area</option>
        {areas.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nameEn}
          </option>
        ))}
      </select>
    </div>
  );
}
