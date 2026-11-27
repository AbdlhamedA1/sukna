'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ApartmentCard } from '../../../components/apartments/ApartmentCard';
import { AreaInfo } from '../../../components/apartments/AreaInfo';
import type { BuildingItem } from '../../../components/apartments/BuildingCard';
import { AuthNav } from '../../../components/layout/AuthNav';
import { apiFetch } from '../../../lib/api';
import type { ApartmentListItem } from '../../../types/apartments';

type Building = BuildingItem & { googleMapsUrl: string; additionalImages: string[] };

export default function BuildingPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{ building: Building; apartments: ApartmentListItem[] } | null | undefined>(undefined);

  useEffect(() => {
    apiFetch<{ data: { building: Building; apartments: ApartmentListItem[] } }>(`/buildings/${id}`)
      .then((r) => setData(r.data))
      .catch(() => setData(null));
  }, [id]);

  const b = data?.building;
  const place = b ? [b.areaId?.nameEn, b.cityId?.nameEn, b.governorateId?.nameEn].filter(Boolean).join(', ') : '';
  const photos = b ? [b.mainImage, ...(b.additionalImages ?? [])] : [];

  return (
    <main className="min-h-screen bg-brand-surface pb-16">
      <header className="border-b border-brand-border bg-white">
        <div className="mx-auto flex w-full max-w-container items-center justify-between px-4 py-4 sm:px-8">
          <a href="/" className="text-xl font-bold text-brand-primary">SUKNA</a>
          <AuthNav />
        </div>
      </header>
      <div className="mx-auto w-full max-w-container px-4 py-6 sm:px-8">
        <a href="/buildings" className="text-sm font-semibold text-brand-primary hover:underline">&larr; All buildings</a>
        {data === undefined && <div className="mt-4 aspect-[16/7] animate-pulse rounded-2xl bg-brand-primary-soft" />}
        {data === null && <p className="mt-10 text-center text-brand-muted">This building is not available.</p>}
        {data && b && (
          <>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {photos.slice(0, 3).map((src, i) => (
                <img key={src + i} src={src} alt={i === 0 ? b.name : ''} decoding="async" fetchPriority={i === 0 ? 'high' : undefined} className={`w-full rounded-2xl object-cover ${i === 0 ? 'aspect-[4/3] sm:col-span-2 sm:row-span-1 sm:h-full' : 'aspect-[4/3]'}`} />
              ))}
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <section className="lg:col-span-2">
                <h1 className="text-2xl font-bold text-brand-primary">{b.name}</h1>
                <p className="mt-1 text-brand-muted">{b.streetAddress}{place ? ` · ${place}` : ''}</p>
                {b.description ? <p className="mt-4 whitespace-pre-line text-brand-ink">{b.description}</p> : null}
                <h2 className="mt-8 text-xl font-bold text-brand-primary">Apartments in this building</h2>
                {data.apartments.length === 0 ? (
                  <p className="mt-3 rounded-2xl border border-dashed border-brand-border bg-white p-6 text-brand-muted">
                    No apartments are listed here yet. Check back soon.
                  </p>
                ) : (
                  <div className="mt-4 grid gap-6 sm:grid-cols-2">
                    {data.apartments.map((a) => (
                      <ApartmentCard key={a._id} apartment={{ ...a, buildingId: { _id: b._id, name: b.name, streetAddress: b.streetAddress, googleMapsUrl: b.googleMapsUrl } }} />
                    ))}
                  </div>
                )}
              </section>
              <aside className="flex flex-col gap-4">
                <a
                  href={b.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-12 cursor-pointer items-center justify-center rounded-lg bg-brand-primary font-semibold text-white transition hover:opacity-90"
                >
                  Open in Google Maps
                </a>
                <AreaInfo buildingId={b._id} />
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
