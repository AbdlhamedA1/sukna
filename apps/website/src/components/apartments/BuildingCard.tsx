import Link from 'next/link';

export interface BuildingItem {
  _id: string;
  name: string;
  description: string;
  mainImage: string;
  streetAddress: string;
  governorateId?: { nameEn: string };
  cityId?: { nameEn: string };
  areaId?: { nameEn: string };
}

export function BuildingCard({ building }: { building: BuildingItem }) {
  const place = [building.areaId?.nameEn, building.cityId?.nameEn, building.governorateId?.nameEn]
    .filter(Boolean)
    .join(', ');
  return (
    <Link
      href={`/buildings/${building._id}`}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-brand-surface">
        <img
          src={building.mainImage}
          alt={building.name}
          loading="lazy"
          decoding="async"
          width={400}
          height={300}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-1 p-4">
        <h3 className="line-clamp-1 text-lg font-bold text-brand-primary">{building.name}</h3>
        <p className="line-clamp-1 text-sm text-brand-muted">{building.streetAddress}</p>
        {place ? <p className="line-clamp-1 text-xs text-brand-muted">{place}</p> : null}
      </div>
    </Link>
  );
}
