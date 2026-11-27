'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from './api';

export interface Landmark {
  _id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
}

export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

export function formatDistance(m: number): string {
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}

let landmarksPromise: Promise<Landmark[]> | null = null;

/** Shared, fetched once per page load. */
export function useLandmarks(): Landmark[] {
  const [items, setItems] = useState<Landmark[]>([]);
  useEffect(() => {
    landmarksPromise ??= apiFetch<{ data: { landmarks: Landmark[] } }>('/landmarks')
      .then((r) => r.data.landmarks)
      .catch(() => []);
    void landmarksPromise.then(setItems);
  }, []);
  return items;
}
