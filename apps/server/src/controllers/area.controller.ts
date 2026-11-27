import type { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import { httpError } from '../middleware/errorHandler.js';
import { Building } from '../models/Building.js';
import { Landmark } from '../models/Landmark.js';
import { distanceMeters, walkMinutes, type LatLng } from '../utils/geo.js';

const RADIUS_M = 600;
const MAX_LANDMARK_KM = 8;
const REFRESH_MS = 30 * 24 * 60 * 60 * 1000;

const CATEGORIES: Record<string, string> = {
  grocery: 'shop~"^(supermarket|convenience|bakery|greengrocer|butcher|mall|general)$"',
  pharmacy: 'amenity~"^(pharmacy)$"',
  health: 'amenity~"^(clinic|hospital|doctors|dentist)$"',
  food: 'amenity~"^(restaurant|cafe|fast_food)$"',
  money: 'amenity~"^(bank|atm)$"',
  transport: 'highway=bus_stop',
};

async function fetchCounts(p: LatLng): Promise<Record<string, number> | null> {
  const body = `[out:json][timeout:15];(${Object.entries(CATEGORIES)
    .map(([k, f]) => `nwr[${f}](around:${RADIUS_M},${p.lat},${p.lng});`)
    .join('')});out tags center 200;`;
  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(body)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'SuknaBot/1.0' },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { elements: { tags?: Record<string, string> }[] };
    const counts: Record<string, number> = Object.fromEntries(Object.keys(CATEGORIES).map((k) => [k, 0]));
    for (const el of json.elements) {
      const t = el.tags ?? {};
      if (t.shop && /^(supermarket|convenience|bakery|greengrocer|butcher|mall|general)$/.test(t.shop)) counts.grocery += 1;
      else if (t.amenity === 'pharmacy') counts.pharmacy += 1;
      else if (t.amenity && /^(clinic|hospital|doctors|dentist)$/.test(t.amenity)) counts.health += 1;
      else if (t.amenity && /^(restaurant|cafe|fast_food)$/.test(t.amenity)) counts.food += 1;
      else if (t.amenity === 'bank' || t.amenity === 'atm') counts.money += 1;
      else if (t.highway === 'bus_stop') counts.transport += 1;
    }
    return counts;
  } catch {
    return null;
  }
}

function levelOf(counts: Record<string, number>): 'well_served' | 'some' | 'far' {
  const present = Object.values(counts).filter((n) => n > 0).length;
  return present >= 4 ? 'well_served' : present >= 2 ? 'some' : 'far';
}

/** GET /buildings/:id/area - public. Distance to landmarks plus nearby-services summary. */
export async function getBuildingArea(req: Request, res: Response, next: NextFunction) {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) throw httpError(404, 'Building not found.');
    const building = await Building.findOne({ _id: req.params.id, isDeleted: false, isActive: true });
    if (!building) throw httpError(404, 'Building not found.');
    const here = building.location;
    if (!here) {
      res.json({ success: true, data: { hasLocation: false, landmarks: [], services: null } });
      return;
    }

    const lm = await Landmark.find({ isActive: true });
    const landmarks = lm
      .map((l) => {
        const meters = distanceMeters(here, { lat: l.lat, lng: l.lng });
        return { name: l.name, type: l.type, meters, walkMinutes: walkMinutes(meters) };
      })
      .filter((l) => l.meters <= MAX_LANDMARK_KM * 1000)
      .sort((a, b) => a.meters - b.meters)
      .slice(0, 3);

    const cached = building.services as { computedAt: Date } | null;
    let services = building.services as
      | { computedAt: Date; counts: Record<string, number>; level: string }
      | null;
    if (!services || Date.now() - new Date(cached!.computedAt).getTime() > REFRESH_MS) {
      const counts = await fetchCounts(here);
      if (counts) {
        services = { computedAt: new Date(), counts, level: levelOf(counts) };
        await Building.updateOne({ _id: building._id }, { $set: { services } });
      }
    }
    res.json({ success: true, data: { hasLocation: true, radiusMeters: RADIUS_M, landmarks, services } });
  } catch (err) {
    next(err);
  }
}

export async function listLandmarks(_req: Request, res: Response, next: NextFunction) {
  try {
    const landmarks = await Landmark.find({ isActive: true }).select('name type lat lng');
    res.json({ success: true, data: { landmarks } });
  } catch (err) {
    next(err);
  }
}
