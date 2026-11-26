import Link from 'next/link';

import type { ApartmentListItem } from '../../types/apartments';

const RENTAL_LABEL = { entire: 'Entire place', shared: 'Shared', private_room: 'Private room' };
const FURNISHED_LABEL = {
  furnished: 'Furnished',
  semi_furnished: 'Semi-furnished',
  unfurnished: 'Unfurnished',
};

export function ApartmentCard({ apartment }: { apartment: ApartmentListItem }) {
  return (
    <Link
      href={`/apartments/${apartment._id}`}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-surface">
        {/* Plain img keeps the template dependency-free; images are admin-curated Cloudinary URLs. */}
        <img
          src={apartment.images[0]}
          alt={apartment.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-white">
          {RENTAL_LABEL[apartment.rentalType]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-lg font-bold text-brand-accent">
          EGP {apartment.rentalPrice.toLocaleString()}
          <span className="text-sm font-normal text-brand-muted"> /month</span>
        </p>
        <h3 className="line-clamp-1 font-semibold text-brand-ink">{apartment.title}</h3>
        <p className="line-clamp-1 text-sm text-brand-muted">
          {apartment.buildingId.name} &middot; {apartment.buildingId.streetAddress}
        </p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-brand-muted">
          <span>{apartment.bedrooms} bed</span>
          <span>{apartment.bathrooms} bath</span>
          <span>Floor {apartment.floor}</span>
          <span>{FURNISHED_LABEL[apartment.furnishedStatus]}</span>
        </div>
      </div>
    </Link>
  );
}
