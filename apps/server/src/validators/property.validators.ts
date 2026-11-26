import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid MongoDB ObjectId.');

export const createBuildingSchema = z
  .object({
    name: z.string().trim().min(3).max(150),
    description: z.string().max(1000).default(''),
    mainImage: z.string().url(),
    mainImagePublicId: z.string().min(1),
    additionalImages: z.array(z.string().url()).max(10).default([]),
    additionalImagePublicIds: z.array(z.string()).max(10).default([]),
    governorateId: objectId,
    cityId: objectId,
    areaId: objectId,
    streetAddress: z.string().trim().min(5).max(250),
    googleMapsUrl: z.string().url(),
  })
  .strip();

export const updateBuildingSchema = createBuildingSchema.partial().strip();

export const buildingQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    governorateId: objectId.optional(),
    cityId: objectId.optional(),
    areaId: objectId.optional(),
  })
  .strip();

export const apartmentQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    governorateId: objectId.optional(),
    cityId: objectId.optional(),
    areaId: objectId.optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    rentalType: z.enum(['entire', 'shared', 'private_room']).optional(),
    bedrooms: z.coerce.number().int().min(1).max(15).optional(),
    bathrooms: z.coerce.number().int().min(1).max(10).optional(),
    floor: z.coerce.number().int().min(-2).max(50).optional(),
    furnishedStatus: z.enum(['furnished', 'semi_furnished', 'unfurnished']).optional(),
    sortBy: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
  })
  .strip();

/** Egyptian mobile: 01x xxxx xxxx local, or already-E.164 +20... */
const EG_MOBILE = /^(?:\+20|0)?1[0-9]{9}$/;

export function normalizeEgyptianPhone(raw: string): string | null {
  const clean = raw.replace(/[\s-]/g, '');
  if (!EG_MOBILE.test(clean)) return null;
  const national = clean.replace(/^\+20/, '').replace(/^0/, '');
  return `+20${national}`;
}

export const createApartmentSchema = z
  .object({
    buildingId: objectId,
    title: z.string().trim().min(5).max(150),
    description: z.string().min(20).max(3000),
    rentalPrice: z.number().min(100).max(500000),
    rentalType: z.enum(['entire', 'shared', 'private_room']).default('entire'),
    bedrooms: z.number().int().min(1).max(15),
    bathrooms: z.number().int().min(1).max(10),
    floor: z.number().int().min(-2).max(50),
    furnishedStatus: z.enum(['furnished', 'semi_furnished', 'unfurnished']).default('unfurnished'),
    images: z.array(z.string().url()).min(1).max(10),
    imagePublicIds: z.array(z.string()).min(1).max(10),
    ownerName: z.string().trim().min(2).max(100),
    ownerPhone: z.string().transform((val, ctx) => {
      const normalized = normalizeEgyptianPhone(val);
      if (!normalized) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid Egyptian phone number.' });
        return z.NEVER;
      }
      return normalized;
    }),
  })
  .strip();

export const updateApartmentSchema = createApartmentSchema.partial().strip();

export const apartmentStatusSchema = z
  .object({
    listingStatus: z.enum(['pending', 'published', 'rejected', 'unpublished']),
    rejectionReason: z.string().max(500).default(''),
    internalAdminNotes: z.string().max(1000).default(''),
  })
  .strip();

export const apartmentAvailabilitySchema = z
  .object({ availabilityStatus: z.enum(['available', 'rented']) })
  .strip();
