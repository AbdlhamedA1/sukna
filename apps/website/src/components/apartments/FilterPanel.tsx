'use client';

import { useState } from 'react';

import { LocationCascade } from '../locations/LocationCascade';

export interface CatalogFilters {
  governorateId?: string;
  cityId?: string;
  areaId?: string;
  minPrice?: number;
  maxPrice?: number;
  rentalType?: string;
  bedrooms?: number;
  furnishedStatus?: string;
  sortBy: string;
}

interface FilterPanelProps {
  filters: CatalogFilters;
  onChange: (next: CatalogFilters) => void;
}

const inputClass =
  'h-11 w-full rounded-lg border border-brand-border bg-white px-3 text-sm text-brand-ink outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30';

/** Shared filter form used by the desktop sidebar and the mobile bottom sheet. */
export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const set = (patch: Partial<CatalogFilters>) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-sm font-semibold text-brand-ink">Location</p>
        <LocationCascade
          onChange={(sel) => set(sel)}
          className="grid grid-cols-1 gap-2 sm:grid-cols-1"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-brand-ink">Monthly rent (EGP)</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            className={inputClass}
            value={filters.minPrice ?? ''}
            onChange={(e) => set({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
          <input
            type="number"
            min={0}
            placeholder="Max"
            className={inputClass}
            value={filters.maxPrice ?? ''}
            onChange={(e) => set({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-brand-ink">Rental type</p>
        <select
          className={inputClass}
          value={filters.rentalType ?? ''}
          onChange={(e) => set({ rentalType: e.target.value || undefined })}
        >
          <option value="">Any</option>
          <option value="entire">Entire place</option>
          <option value="shared">Shared</option>
          <option value="private_room">Private room</option>
        </select>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-brand-ink">Bedrooms</p>
        <select
          className={inputClass}
          value={filters.bedrooms ?? ''}
          onChange={(e) => set({ bedrooms: e.target.value ? Number(e.target.value) : undefined })}
        >
          <option value="">Any</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-brand-ink">Furnishing</p>
        <select
          className={inputClass}
          value={filters.furnishedStatus ?? ''}
          onChange={(e) => set({ furnishedStatus: e.target.value || undefined })}
        >
          <option value="">Any</option>
          <option value="furnished">Furnished</option>
          <option value="semi_furnished">Semi-furnished</option>
          <option value="unfurnished">Unfurnished</option>
        </select>
      </div>

      <button
        type="button"
        onClick={() => onChange({ sortBy: 'newest' })}
        className="text-left text-sm font-medium text-brand-primary hover:underline"
      >
        Clear all filters
      </button>
    </div>
  );
}

/** Mobile: floating filter button + bottom sheet wrapping FilterPanel. */
export function MobileFilterSheet({ filters, onChange }: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full bg-brand-primary px-6 py-3 font-semibold text-white shadow-lg lg:hidden"
      >
        Filters
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close filters"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-8">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-brand-border" />
            <FilterPanel filters={filters} onChange={onChange} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-lg bg-brand-accent font-semibold text-white"
            >
              Show results
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
