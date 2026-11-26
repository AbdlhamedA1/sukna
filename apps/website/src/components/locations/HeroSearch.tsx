'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { LocationCascade } from '../locations/LocationCascade';

/** Hero search bar: cascaded location filters + a search CTA. */
export function HeroSearch() {
  const router = useRouter();
  const [selection, setSelection] = useState<{
    governorateId?: string;
    cityId?: string;
    areaId?: string;
  }>({});

  function handleSearch() {
    const params = new URLSearchParams();
    if (selection.governorateId) params.set('governorateId', selection.governorateId);
    if (selection.cityId) params.set('cityId', selection.cityId);
    if (selection.areaId) params.set('areaId', selection.areaId);
    router.push(`/apartments${params.size ? `?${params.toString()}` : ''}`);
  }

  return (
    <div className="w-full max-w-3xl rounded-2xl border border-brand-border bg-white p-4 shadow-sm sm:p-5">
      <LocationCascade onChange={setSelection} />
      <button
        type="button"
        onClick={handleSearch}
        className="mt-4 flex h-12 w-full items-center justify-center rounded-lg bg-brand-accent font-semibold text-white transition hover:bg-brand-accent-hover active:scale-[0.99] sm:w-auto sm:px-10"
      >
        Search housing
      </button>
    </div>
  );
}
