import type { Metadata } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

interface ApartmentMeta {
  title?: string;
  description?: string;
  rentalPrice?: number;
  images?: string[];
  buildingId?: { name?: string };
}

async function fetchApartment(id: string): Promise<ApartmentMeta | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/apartments/${id}`, { cache: 'no-store' });
    if (!response.ok) return null;
    const body = (await response.json()) as { data?: { apartment?: ApartmentMeta } };
    return body.data?.apartment ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const apartment = await fetchApartment(params.id);
  if (!apartment) return { title: 'Listing not available' };

  const price = apartment.rentalPrice ? `EGP ${apartment.rentalPrice.toLocaleString()}/month` : '';
  const title = price ? `${apartment.title} — ${price}` : String(apartment.title ?? 'Home');
  const description =
    (apartment.description ?? '').trim().slice(0, 155) ||
    `${apartment.title ?? 'Home'} in ${apartment.buildingId?.name ?? 'Upper Egypt'} on SUKNA.`;
  const image = apartment.images?.[0];

  return {
    title,
    description,
    alternates: { canonical: `/apartments/${params.id}` },
    openGraph: {
      type: 'article',
      title,
      description,
      images: image ? [{ url: image, alt: apartment.title ?? 'SUKNA home' }] : undefined,
    },
    twitter: { card: image ? 'summary_large_image' : 'summary', title, description },
  };
}

export default function ApartmentDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
