import type { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import { httpError } from '../middleware/errorHandler.js';
import { Apartment } from '../models/Apartment.js';
import { AuditLog } from '../models/AuditLog.js';
import { Building } from '../models/Building.js';
import { Location } from '../models/Location.js';

/** Rejects inconsistent governorate/city/area combinations with HTTP 400. */
async function assertHierarchy(governorateId: string, cityId: string, areaId: string) {
  const [gov, city, area] = await Promise.all([
    Location.findOne({ _id: governorateId, type: 'governorate' }),
    Location.findOne({ _id: cityId, type: 'city' }),
    Location.findOne({ _id: areaId, type: 'area' }),
  ]);
  if (!gov || !city || !area) {
    throw httpError(400, 'One or more locations do not exist.');
  }
  if (String(city.parentId) !== governorateId) {
    throw httpError(400, 'The selected city does not belong to the selected governorate.');
  }
  if (String(area.parentId) !== cityId) {
    throw httpError(400, 'The selected area does not belong to the selected city.');
  }
}

const PUBLIC_BUILDING_FILTER = { isDeleted: false, isArchived: false, isActive: true };

/** GET /buildings - public, paginated, allowlisted filters. */
export async function listBuildings(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, governorateId, cityId, areaId } = req.query as unknown as {
      page: number;
      limit: number;
      governorateId?: string;
      cityId?: string;
      areaId?: string;
    };
    const filter: Record<string, unknown> = { ...PUBLIC_BUILDING_FILTER };
    if (governorateId) filter.governorateId = governorateId;
    if (cityId) filter.cityId = cityId;
    if (areaId) filter.areaId = areaId;

    const [items, total] = await Promise.all([
      Building.find(filter)
        .populate('governorateId cityId areaId', 'nameEn nameAr type')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Building.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: { buildings: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
  } catch (err) {
    next(err);
  }
}

/** GET /buildings/:id - public detail + its published available apartments. */
export async function getBuilding(req: Request, res: Response, next: NextFunction) {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return next(httpError(404, 'Building not found.'));
    const building = await Building.findOne({ _id: req.params.id, ...PUBLIC_BUILDING_FILTER })
      .populate('governorateId cityId areaId', 'nameEn nameAr type');
    if (!building) return next(httpError(404, 'Building not found.'));

    const apartments = await Apartment.find({
      buildingId: building._id,
      isDeleted: false,
      listingStatus: 'published',
      availabilityStatus: 'available',
    }).select('-ownerPhone -internalAdminNotes');

    res.status(200).json({ success: true, data: { building, apartments } });
  } catch (err) {
    next(err);
  }
}

/** POST /buildings - admin. */
export async function createBuilding(req: Request, res: Response, next: NextFunction) {
  try {
    const { governorateId, cityId, areaId } = req.body;
    await assertHierarchy(governorateId, cityId, areaId);
    const building = await Building.create(req.body);

    await AuditLog.create({
      actorId: new Types.ObjectId(req.user!.id),
      actorRole: 'admin',
      ipAddress: req.ip ?? 'unknown',
      userAgent: req.get('user-agent')?.slice(0, 250) ?? '',
      action: 'PROPERTY_CREATED',
      targetEntity: 'Building',
      targetId: building._id as Types.ObjectId,
      metadata: { name: building.name },
    });

    res.status(201).json({ success: true, data: { building } });
  } catch (err) {
    next(err);
  }
}

/** PUT /buildings/:id - admin. */
export async function updateBuilding(req: Request, res: Response, next: NextFunction) {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return next(httpError(404, 'Building not found.'));
    const building = await Building.findOne({ _id: req.params.id, isDeleted: false });
    if (!building) return next(httpError(404, 'Building not found.'));

    const { governorateId, cityId, areaId } = req.body;
    if (governorateId || cityId || areaId) {
      await assertHierarchy(
        governorateId ?? String(building.governorateId),
        cityId ?? String(building.cityId),
        areaId ?? String(building.areaId),
      );
    }
    Object.assign(building, req.body);
    await building.save();

    await AuditLog.create({
      actorId: new Types.ObjectId(req.user!.id),
      actorRole: 'admin',
      ipAddress: req.ip ?? 'unknown',
      userAgent: req.get('user-agent')?.slice(0, 250) ?? '',
      action: 'PROPERTY_UPDATED',
      targetEntity: 'Building',
      targetId: building._id as Types.ObjectId,
      metadata: { updatedFields: Object.keys(req.body) },
    });

    res.status(200).json({ success: true, data: { building } });
  } catch (err) {
    next(err);
  }
}

/** PATCH /buildings/:id/archive - admin toggle. */
export async function archiveBuilding(req: Request, res: Response, next: NextFunction) {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return next(httpError(404, 'Building not found.'));
    const building = await Building.findOne({ _id: req.params.id, isDeleted: false });
    if (!building) return next(httpError(404, 'Building not found.'));

    building.isArchived = !building.isArchived;
    await building.save();

    await AuditLog.create({
      actorId: new Types.ObjectId(req.user!.id),
      actorRole: 'admin',
      ipAddress: req.ip ?? 'unknown',
      userAgent: req.get('user-agent')?.slice(0, 250) ?? '',
      action: 'PROPERTY_ARCHIVED',
      targetEntity: 'Building',
      targetId: building._id as Types.ObjectId,
      metadata: { isArchived: building.isArchived },
    });

    res.status(200).json({ success: true, data: { building } });
  } catch (err) {
    next(err);
  }
}

/** DELETE /buildings/:id - admin soft delete, blocked by published apartments. */
export async function deleteBuilding(req: Request, res: Response, next: NextFunction) {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return next(httpError(404, 'Building not found.'));
    const building = await Building.findOne({ _id: req.params.id, isDeleted: false });
    if (!building) return next(httpError(404, 'Building not found.'));

    const liveListings = await Apartment.countDocuments({
      buildingId: building._id,
      isDeleted: false,
      listingStatus: 'published',
    });
    if (liveListings > 0) {
      return next(
        httpError(
          400,
          'Building has published apartments. Unpublish or reassign them before deleting.',
        ),
      );
    }

    building.isDeleted = true;
    building.deletedAt = new Date();
    await building.save();

    await AuditLog.create({
      actorId: new Types.ObjectId(req.user!.id),
      actorRole: 'admin',
      ipAddress: req.ip ?? 'unknown',
      userAgent: req.get('user-agent')?.slice(0, 250) ?? '',
      action: 'PROPERTY_SOFT_DELETED',
      targetEntity: 'Building',
      targetId: building._id as Types.ObjectId,
      metadata: { name: building.name },
    });

    res.status(200).json({ success: true, message: 'Building deleted.' });
  } catch (err) {
    next(err);
  }
}

/** GET /buildings/admin/all - admin, full list incl. archived/inactive (excludes soft-deleted). */
export async function listBuildingsAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const filter: Record<string, unknown> = { isDeleted: false };
    if (req.query.isArchived !== undefined) filter.isArchived = req.query.isArchived === 'true';
    const buildings = await Building.find(filter)
      .populate('governorateId cityId areaId', 'nameEn nameAr type')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { buildings } });
  } catch (err) {
    next(err);
  }
}
