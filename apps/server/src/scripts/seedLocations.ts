/**
 * Seeds the initial 3-tier geographic hierarchy (Qena, Sohag, Minya).
 * Idempotent: matches on (nameEn, type, parentId) and skips existing rows.
 *
 * Usage: npm run seed:locations
 */
import 'dotenv/config';
import mongoose from 'mongoose';

import { env } from '../config/env.js';
import { Location } from '../models/Location.js';

interface AreaSeed {
  nameEn: string;
  nameAr: string;
}
interface CitySeed {
  nameEn: string;
  nameAr: string;
  areas: AreaSeed[];
}
interface GovSeed {
  nameEn: string;
  nameAr: string;
  cities: CitySeed[];
}

const TREE: GovSeed[] = [
  {
    nameEn: 'Qena',
    nameAr: 'قنا',
    cities: [
      {
        nameEn: 'Qena City',
        nameAr: 'مدينة قنا',
        areas: [
          { nameEn: 'City Center', nameAr: 'وسط البلد' },
          { nameEn: 'University District', nameAr: 'حي الجامعة' },
        ],
      },
      { nameEn: 'Nag Hammadi', nameAr: 'نجع حمادي', areas: [] },
      { nameEn: 'Dishna', nameAr: 'دشنا', areas: [] },
    ],
  },
  {
    nameEn: 'Sohag',
    nameAr: 'سوهاج',
    cities: [
      {
        nameEn: 'Sohag City',
        nameAr: 'مدينة سوهاج',
        areas: [
          { nameEn: 'City Center', nameAr: 'وسط البلد' },
          { nameEn: 'University District', nameAr: 'حي الجامعة' },
        ],
      },
      { nameEn: 'Akhmim', nameAr: 'أخميم', areas: [] },
      { nameEn: 'Girga', nameAr: 'جرجا', areas: [] },
    ],
  },
  {
    nameEn: 'Minya',
    nameAr: 'المنيا',
    cities: [
      {
        nameEn: 'Minya City',
        nameAr: 'مدينة المنيا',
        areas: [
          { nameEn: 'City Center', nameAr: 'وسط البلد' },
          { nameEn: 'University District', nameAr: 'حي الجامعة' },
        ],
      },
      { nameEn: 'Mallawi', nameAr: 'ملوي', areas: [] },
      { nameEn: 'Beni Mazar', nameAr: 'بني مزار', areas: [] },
    ],
  },
];

async function upsertLocation(
  nameEn: string,
  nameAr: string,
  type: 'governorate' | 'city' | 'area',
  parentId: mongoose.Types.ObjectId | null,
  displayOrder: number,
) {
  const existing = await Location.findOne({ nameEn, type, parentId });
  if (existing) return { doc: existing, created: false };
  const doc = await Location.create({ nameEn, nameAr, type, parentId, displayOrder, isActive: true });
  return { doc, created: true };
}

async function main() {
  await mongoose.connect(env.mongodbUri);
  let created = 0;

  for (const [gi, gov] of TREE.entries()) {
    const g = await upsertLocation(gov.nameEn, gov.nameAr, 'governorate', null, gi + 1);
    if (g.created) created += 1;
    for (const [ci, city] of gov.cities.entries()) {
      const c = await upsertLocation(city.nameEn, city.nameAr, 'city', g.doc._id, ci + 1);
      if (c.created) created += 1;
      for (const [ai, area] of city.areas.entries()) {
        const a = await upsertLocation(area.nameEn, area.nameAr, 'area', c.doc._id, ai + 1);
        if (a.created) created += 1;
      }
    }
  }

  const counts = await Location.aggregate([{ $group: { _id: '$type', n: { $sum: 1 } } }]);
  console.log('[seed:locations] done. new:', created, 'totals:', JSON.stringify(counts));
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[seed:locations] failed:', err);
  process.exit(1);
});
