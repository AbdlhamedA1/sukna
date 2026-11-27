import Link from 'next/link';

import type { ApartmentListItem } from '../../types/apartments';

import { distanceMeters, formatDistance, useLandmarks } from '../../lib/geo';
import { FavoriteButton } from './FavoriteButton';

const RENTAL_LABEL = { entire: 'Entire place', shared: 'Shared', private_room: 'Private room' };
const FURNISHED_LABEL = {
  furnished: 'Furnished',
  semi_furnished: 'Semi-furnished',
  unfurnished: 'Unfurnished',
};

export function ApartmentCard({ apartment }: { apartment: ApartmentListItem }) {
  const landmarks = useLandmarks();
  const here = apartment.buildingId.location;
  const nearest = here
    ? landmarks
        .map((l) => ({ name: l.name, m: distanceMeters(here, l) }))
        .sort((a, b) => a.m - b.m)[0]
    : undefined;
  const specs = [
    `${apartment.bedrooms} bed`,
    `${apartment.bathrooms} bath`,
    `Floor ${apartment.floor}`,
    FURNISHED_LABEL[apartment.furnishedStatus],
  ];
  return (
    <Link
      href={`/apartments/${apartment._id}`}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-brand-border bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-surface">
        {/* Plain img keeps the template dependency-free; images are admin-curated Cloudinary URLs. */}
        <img
          src={apartment.images[0]}
          alt={apartment.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          width={400}
          height={300}
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand-primary backdrop-blur-sm">
          {RENTAL_LABEL[apartment.rentalType]}
        </span>
        <FavoriteButton apartmentId={apartment._id} className="absolute right-3 top-3" />
        {apartment.isFeatured ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-brand-primary shadow-sm">
            Featured
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <p className="text-xl font-extrabold text-brand-primary">
          EGP {apartment.rentalPrice.toLocaleString()}
          <span className="text-sm font-normal text-brand-muted"> /month</span>
        </p>
        <h3 className="line-clamp-1 font-bold text-brand-ink">{apartment.title}</h3>
        <p className="line-clamp-1 text-sm text-brand-muted">
          {apartment.buildingId.name} &middot; {apartment.buildingId.streetAddress}
        </p>
        {nearest && nearest.m <= 8000 ? (
          <p className="mt-0.5 w-fit rounded-full bg-brand-primary-soft px-2.5 py-1 text-xs font-semibold text-brand-primary">
            {formatDistance(nearest.m)} from {nearest.name}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-brand-border/60 pt-3 text-xs text-brand-muted">
          {specs.map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              {i > 0 ? <span aria-hidden className="h-1 w-1 rounded-full bg-brand-border" /> : null}
              {s}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
