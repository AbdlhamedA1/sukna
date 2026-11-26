'use client';

import { Image } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { FavoriteButton } from '../../../components/apartments/FavoriteButton';
import { apiFetch } from '../../../lib/api';

interface ApartmentDetail {
  _id: string;
  title: string;
  description: string;
  rentalPrice: number;
  rentalType: string;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  furnishedStatus: string;
  images: string[];
  isFeatured?: boolean;
  buildingId: {
    _id: string;
    name: string;
    streetAddress: string;
    googleMapsUrl: string;
  };
}

interface ContactInfo {
  ownerName: string;
  displayPhone: string;
  whatsAppLink: string;
}

/** Prefer exact coordinates from the Google Maps link (@lat,lng or ?q=lat,lng); fall back to the address. */
function mapEmbedQuery(url: string, fallback: string): string {
  const m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ?? url.match(/[?&](?:q|query|ll)=(-?\d+\.\d+)(?:,|%2C)(-?\d+\.\d+)/);
  return m ? `${m[1]},${m[2]}` : fallback;
}

export default function ApartmentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [apartment, setApartment] = useState<ApartmentDetail | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [contactError, setContactError] = useState('');
  const [showContact, setShowContact] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ data: { apartment: ApartmentDetail } }>(`/apartments/${params.id}`)
      .then((res) => setApartment(res.data.apartment))
      .catch(() => setApartment(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function revealContact() {
    setContactError('');
    try {
      const res = await apiFetch<{ data: ContactInfo }>(`/apartments/${params.id}/contact`);
      setContact(res.data);
    } catch {
      setContactError('Log in with a verified account to see the landlord contact.');
    }
  }

  if (loading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-container px-4 py-10 sm:px-8">
        <div className="aspect-[16/9] animate-pulse rounded-2xl bg-brand-primary-soft" />
      </main>
    );
  }
  if (!apartment) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="font-semibold text-brand-ink">This listing is no longer available.</p>
        <button
          type="button"
          onClick={() => router.push('/apartments')}
          className="font-semibold text-brand-accent hover:underline"
        >
          Back to all homes
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-surface pb-16">
      <div className="mx-auto w-full max-w-container px-4 py-6 sm:px-8">
        <button
          type="button"
          onClick={() => router.push('/apartments')}
          className="mb-4 text-sm font-semibold text-brand-primary hover:underline"
        >
          &larr; All homes
        </button>

        {/* Gallery */}
        <div className="overflow-hidden rounded-2xl border border-brand-border bg-white">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            aria-label="Open image full screen"
            className="group block w-full cursor-pointer overflow-hidden"
          >
            <img
              src={apartment.images[activeImage]}
              alt={apartment.title}
              fetchPriority="high"
              decoding="async"
              className="aspect-[16/9] w-full object-cover transition duration-300 group-hover:scale-[1.03] group-hover:brightness-95"
            />
          </button>
          <div style={{ display: 'none' }}>
            <Image.PreviewGroup
              preview={{
                visible: previewOpen,
                current: activeImage,
                onVisibleChange: setPreviewOpen,
                onChange: setActiveImage,
              }}
            >
              {apartment.images.map((src, i) => (
                <Image key={src + i} src={src} alt={apartment.title} />
              ))}
            </Image.PreviewGroup>
          </div>
          {apartment.images.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto p-3">
              {apartment.images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-24 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition hover:opacity-80 ${
                    i === activeImage ? 'border-brand-accent' : 'border-transparent'
                  }`}
                >
                  <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-brand-border bg-white p-5 sm:p-6 lg:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <p className="text-2xl font-bold text-brand-accent">
                EGP {apartment.rentalPrice.toLocaleString()}
                <span className="text-base font-normal text-brand-muted"> /month</span>
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${apartment.title} on SUKNA: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 cursor-pointer items-center rounded-full border border-brand-border px-4 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary-soft"
                >
                  Share
                </a>
                <FavoriteButton apartmentId={apartment._id} className="border border-brand-border" />
              </div>
            </div>
            <h1 className="mt-1 text-xl font-bold text-brand-primary sm:text-2xl">
              {apartment.title}
            </h1>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-brand-muted">
              <span>{apartment.bedrooms} bedrooms</span>
              <span>{apartment.bathrooms} bathrooms</span>
              <span>Floor {apartment.floor}</span>
              <span className="capitalize">{apartment.furnishedStatus.replace('_', ' ')}</span>
              <span className="capitalize">{apartment.rentalType.replace('_', ' ')}</span>
            </div>
            <p className="mt-5 whitespace-pre-line leading-relaxed text-brand-ink">
              {apartment.description}
            </p>
          </section>

          <aside className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-2xl border border-brand-border bg-white">
              <div className="p-5 pb-3">
                <h2 className="font-bold text-brand-primary">Location</h2>
                <p className="mt-1 text-sm text-brand-ink">{apartment.buildingId.name}</p>
                <p className="text-sm text-brand-muted">{apartment.buildingId.streetAddress}</p>
              </div>
              <a
                href={apartment.buildingId.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open this location in Google Maps"
                className="group relative block h-56 w-full cursor-pointer"
              >
                <iframe
                  title={`Map of ${apartment.buildingId.name}`}
                  loading="lazy"
                  tabIndex={-1}
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(mapEmbedQuery(apartment.buildingId.googleMapsUrl, `${apartment.buildingId.name} ${apartment.buildingId.streetAddress}`))}&output=embed`}
                  className="pointer-events-none h-full w-full border-0"
                />
                <span className="absolute bottom-3 right-3 rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow transition group-hover:bg-brand-accent">
                  Open in Google Maps
                </span>
              </a>
            </div>

            <div className="rounded-2xl border border-brand-border bg-white p-5">
              <h2 className="font-bold text-brand-primary">Landlord contact</h2>
              {contact ? (
                <div className="mt-3 flex flex-col gap-2">
                  <p className="text-brand-ink">{contact.ownerName}</p>
                  <p className="text-lg font-bold tracking-wide text-brand-primary" dir="ltr">
                    {contact.displayPhone}
                  </p>
                  <a
                    href={contact.whatsAppLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 flex h-12 items-center justify-center rounded-lg bg-[#25D366] font-semibold text-white transition hover:opacity-90"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              ) : (
                <>
                  <p className="mt-1 text-sm text-brand-muted">
                    Contact details are shown to logged-in, verified users only.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowContact(true);
                      void revealContact();
                    }}
                    className="mt-3 flex h-12 w-full items-center justify-center rounded-lg bg-brand-accent font-semibold text-white transition hover:bg-brand-accent-hover"
                  >
                    Show contact
                  </button>
                  {showContact && contactError ? (
                    <p className="mt-2 text-sm text-red-600">
                      {contactError}{' '}
                      <a href="/login" className="font-semibold underline">
                        Log in
                      </a>
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
