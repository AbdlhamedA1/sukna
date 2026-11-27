export interface LatLng {
  lat: number;
  lng: number;
}

const ALLOWED_HOSTS = new Set(['maps.app.goo.gl', 'goo.gl', 'www.google.com', 'google.com', 'maps.google.com']);

function valid(lat: number, lng: number): LatLng | null {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
    ? { lat, lng }
    : null;
}

/** Pull coordinates out of a (long) Google Maps URL. Pin coordinates (!3d!4d) beat the viewport (@). */
export function parseCoords(url: string): LatLng | null {
  const pin = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (pin) return valid(Number(pin[1]), Number(pin[2]));
  const at = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (at) return valid(Number(at[1]), Number(at[2]));
  const q = url.match(/[?&](?:q|query|ll|destination)=(-?\d+\.\d+)(?:,|%2C)\s*(-?\d+\.\d+)/i);
  if (q) return valid(Number(q[1]), Number(q[2]));
  return null;
}

/** Resolve a Google Maps link (following short-link redirects on allowlisted hosts only) to coordinates. */
export async function coordsFromMapsUrl(input: string): Promise<LatLng | null> {
  try {
    let url = input;
    for (let hop = 0; hop < 5; hop += 1) {
      const direct = parseCoords(decodeURIComponent(url));
      if (direct) return direct;
      const u = new URL(url);
      if (u.protocol !== 'https:' || !ALLOWED_HOSTS.has(u.hostname)) return null;
      const res = await fetch(url, {
        redirect: 'manual',
        signal: AbortSignal.timeout(6000),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SuknaBot/1.0)' },
      });
      const next = res.headers.get('location');
      if (!next) return null;
      url = new URL(next, url).toString();
    }
  } catch {
    /* best effort */
  }
  return null;
}

export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

/** Rough walking time: straight line x1.3 for street layout at about 80 m/min. */
export function walkMinutes(meters: number): number {
  return Math.max(1, Math.round((meters * 1.3) / 80));
}
