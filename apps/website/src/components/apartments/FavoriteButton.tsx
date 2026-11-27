'use client';

import { useFavorites } from '../../lib/favorites';

export function FavoriteButton({ apartmentId, className = '' }: { apartmentId: string; className?: string }) {
  const { ids, toggle } = useFavorites();
  const saved = ids.has(apartmentId);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? 'Remove from favorites' : 'Save to favorites'}
      title={saved ? 'Remove from favorites' : 'Save to favorites'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggle(apartmentId);
      }}
      className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black/5 bg-white/95 shadow-md backdrop-blur-sm transition hover:scale-110 hover:bg-white ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden
        fill={saved ? '#e11d48' : 'none'}
        stroke={saved ? '#e11d48' : '#0B2540'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
