import { z } from 'zod';

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid MongoDB ObjectId.');

const localizedName = z.string().trim().min(2).max(100);

/** POST /locations - strict parent-child rules enforced in the controller. */
export const createLocationSchema = z
  .object({
    nameAr: localizedName,
    nameEn: localizedName,
    type: z.enum(['governorate', 'city', 'area']),
    parentId: objectId.nullable().default(null),
    displayOrder: z.number().int().min(0).max(10000).default(0),
  })
  .strip();

/** PATCH /locations/:id - names, order and the active toggle. */
export const updateLocationSchema = z
  .object({
    nameAr: localizedName.optional(),
    nameEn: localizedName.optional(),
    displayOrder: z.number().int().min(0).max(10000).optional(),
    isActive: z.boolean().optional(),
  })
  .strip()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided.',
  });

/** GET /locations/admin/all query allowlist. */
export const adminLocationQuerySchema = z
  .object({
    type: z.enum(['governorate', 'city', 'area']).optional(),
    parentId: objectId.nullable().optional(),
  })
  .strip();

export const locationIdParamSchema = z.object({ id: objectId }).strip();
