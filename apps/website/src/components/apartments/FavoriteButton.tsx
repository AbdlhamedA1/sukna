'use client';

import { useFavorites } from '../../lib/favorites';

export function FavoriteButton({ apartmentId, className = '' }: { apartmentId: string; className?: string }) {
  const { ids, toggle } = useFavorites();
  const saved = ids.has(apartmentId);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved homes' : 'Save this home'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggle(apartmentId);
      }}
      className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow transition hover:scale-110 hover:bg-white ${className}`}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden fill={saved ? '#e11d48' : 'none'} stroke={saved ? '#e11d48' : '#123b35'} strokeWidth="2">
        <path d="M12 21s-7-4.6-9.3-9.1C1.2 8.8 3 5.5 6.2 5.5c1.9 0 3.2 1 3.8 2.1.6-1.1 1.9-2.1 3.8-2.1 3.2 0 5 3.3 3.5 6.4C19 16.4 12 21 12 21z" />
      </svg>
    </button>
  );
}
