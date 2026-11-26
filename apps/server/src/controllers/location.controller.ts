import type { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import { httpError } from '../middleware/errorHandler.js';
import { AuditLog } from '../models/AuditLog.js';
import { Location, type ILocation, type LocationType } from '../models/Location.js';

interface LocationNode {
  id: string;
  nameAr: string;
  nameEn: string;
  type: LocationType;
  displayOrder: number;
  children: LocationNode[];
}

function toNode(location: ILocation): LocationNode {
  return {
    id: location.id as string,
    nameAr: location.nameAr,
    nameEn: location.nameEn,
    type: location.type,
    displayOrder: location.displayOrder,
    children: [],
  };
}

/** GET /locations/tree - public, active tiers only, nested 3 levels. */
export async function getLocationTree(_req: Request, res: Response, next: NextFunction) {
  try {
    const locations = await Location.find({ isActive: true }).sort({ displayOrder: 1, nameEn: 1 });
    const byParent = new Map<string, ILocation[]>();
    for (const location of locations) {
      const key = location.parentId ? String(location.parentId) : 'root';
      const bucket = byParent.get(key) ?? [];
      bucket.push(location);
      byParent.set(key, bucket);
    }

    const build = (parentKey: string): LocationNode[] =>
      (byParent.get(parentKey) ?? []).map((location) => {
        const node = toNode(location);
        node.children = build(String(location._id));
        return node;
      });

    res.status(200).json({ success: true, data: { tree: build('root') } });
  } catch (err) {
    next(err);
  }
}

/** GET /locations/admin/all - admin, full catalog incl. inactive. */
export async function listLocationsAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.parentId !== undefined) {
      filter.parentId = req.query.parentId === 'null' ? null : req.query.parentId;
    }
    const locations = await Location.find(filter).sort({ type: 1, displayOrder: 1, nameEn: 1 });
    res.status(200).json({ success: true, data: { locations } });
  } catch (err) {
    next(err);
  }
}

const EXPECTED_PARENT: Record<LocationType, LocationType | null> = {
  governorate: null,
  city: 'governorate',
  area: 'city',
};

/** POST /locations - admin, with strict tier hierarchy validation. */
export async function createLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const { nameAr, nameEn, type, parentId, displayOrder } = req.body as {
      nameAr: string;
      nameEn: string;
      type: LocationType;
      parentId: string | null;
      displayOrder: number;
    };

    const expectedParent = EXPECTED_PARENT[type];
    if (expectedParent === null && parentId !== null) {
      return next(httpError(400, 'A governorate cannot have a parent location.'));
    }
    if (expectedParent !== null) {
      if (!parentId) {
        return next(httpError(400, `${type === 'area' ? 'An' : 'A'} ${type} must belong to a ${expectedParent}.`));
      }
      const parent = await Location.findById(parentId);
      if (!parent) {
        return next(httpError(400, 'Parent location does not exist.'));
      }
      if (parent.type !== expectedParent) {
        return next(
          httpError(400, `A ${type} must belong to a ${expectedParent}, not a ${parent.type}.`),
        );
      }
    }

    const location = await Location.create({ nameAr, nameEn, type, parentId, displayOrder });

    await AuditLog.create({
      actorId: new Types.ObjectId(req.user!.id),
      actorRole: 'admin',
      ipAddress: req.ip ?? 'unknown',
      userAgent: req.get('user-agent')?.slice(0, 250) ?? '',
      action: 'LOCATION_TIER_CREATED',
      targetEntity: 'Location',
      targetId: location._id as Types.ObjectId,
      metadata: { type, nameEn },
    });

    res.status(201).json({ success: true, data: { location } });
  } catch (err) {
    next(err);
  }
}

/** PATCH /locations/:id - admin, names/order/toggle, audited. */
export async function updateLocation(req: Request, res: Response, next: NextFunction) {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) {
      return next(httpError(404, 'Location not found.'));
    }
    const location = await Location.findById(req.params.id);
    if (!location) return next(httpError(404, 'Location not found.'));

    const updates = req.body as Partial<{
      nameAr: string;
      nameEn: string;
      displayOrder: number;
      isActive: boolean;
    }>;

    const toggled = updates.isActive !== undefined && updates.isActive !== location.isActive;
    Object.assign(location, updates);
    await location.save();

    await AuditLog.create({
      actorId: new Types.ObjectId(req.user!.id),
      actorRole: 'admin',
      ipAddress: req.ip ?? 'unknown',
      userAgent: req.get('user-agent')?.slice(0, 250) ?? '',
      action: toggled ? 'LOCATION_TIER_TOGGLED' : 'LOCATION_TIER_UPDATED',
      targetEntity: 'Location',
      targetId: location._id as Types.ObjectId,
      metadata: { updatedFields: Object.keys(updates) },
    });

    res.status(200).json({ success: true, data: { location } });
  } catch (err) {
    next(err);
  }
}
