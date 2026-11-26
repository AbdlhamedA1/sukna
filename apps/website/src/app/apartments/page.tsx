'use client';

import { useEffect, useState } from 'react';

import { ApartmentCard } from '../../components/apartments/ApartmentCard';
import {
  FilterPanel,
  MobileFilterSheet,
  type CatalogFilters,
} from '../../components/apartments/FilterPanel';
import { apiFetch } from '../../lib/api';
import type { ApartmentListItem } from '../../types/apartments';

interface ListResponse {
  data: {
    apartments: ApartmentListItem[];
    pagination: { page: number; limit: number; total: number; pages: number };
  };
}

export default function ApartmentsPage() {
  const [filters, setFilters] = useState<CatalogFilters>({ sortBy: 'newest' });
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<ListResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value));
    });
    params.set('page', String(page));
    params.set('limit', '12');
    apiFetch<ListResponse>(`/apartments?${params.toString()}`)
      .then((res) => setResult(res.data))
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, [filters, page]);

  return (
    <main className="min-h-screen bg-brand-surface">
      <header className="border-b border-brand-border bg-white">
        <div className="mx-auto flex w-full max-w-container items-center justify-between px-4 py-4 sm:px-8">
          <a href="/" className="text-xl font-bold text-brand-primary">
            SUKNA <span className="font-arabic">سُكنا</span>
          </a>
          <a
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-primary-soft"
          >
            Log in
          </a>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-container gap-8 px-4 py-8 sm:px-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="rounded-2xl border border-brand-border bg-white p-5">
            <h2 className="mb-4 font-bold text-brand-primary">Filters</h2>
            <FilterPanel
              filters={filters}
              onChange={(next) => {
                setFilters(next);
                setPage(1);
              }}
            />
          </div>
        </aside>

        <section className="flex-1 pb-24 lg:pb-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-bold text-brand-primary sm:text-2xl">
              {result ? `${result.pagination.total} ${result.pagination.total === 1 ? "home" : "homes"}` : 'Homes'}
            </h1>
            <select
              aria-label="Sort by"
              className="h-11 rounded-lg border border-brand-border bg-white px-3 text-sm text-brand-ink"
              value={filters.sortBy}
              onChange={(e) => {
                setFilters({ ...filters, sortBy: e.target.value });
                setPage(1);
              }}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] animate-pulse rounded-2xl bg-brand-primary-soft"
                />
              ))}
            </div>
          ) : result && result.apartments.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {result.apartments.map((apartment) => (
                <ApartmentCard key={apartment._id} apartment={apartment} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-brand-border bg-white p-10 text-center">
              <p className="font-semibold text-brand-ink">No homes match these filters yet.</p>
              <p className="mt-1 text-sm text-brand-muted">
                Try widening the price range or picking another area.
              </p>
            </div>
          )}

          {result && result.pagination.pages > 1 ? (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="h-11 rounded-lg border border-brand-border bg-white px-5 text-sm font-semibold text-brand-primary disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-brand-muted">
                Page {page} of {result.pagination.pages}
              </span>
              <button
                type="button"
                disabled={page >= result.pagination.pages}
                onClick={() => setPage(page + 1)}
                className="h-11 rounded-lg border border-brand-border bg-white px-5 text-sm font-semibold text-brand-primary disabled:opacity-40"
              >
                Next
              </button>
            </div>
          ) : null}
        </section>
      </div>

      <MobileFilterSheet
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />
    </main>
  );
}
