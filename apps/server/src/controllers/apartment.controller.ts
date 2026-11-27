import type { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import { httpError } from '../middleware/errorHandler.js';
import { Apartment } from '../models/Apartment.js';
import { AuditLog } from '../models/AuditLog.js';
import { AdvertisingOrder } from '../models/AdvertisingOrder.js';
import { Building } from '../models/Building.js';

const PUBLIC_LISTING = {
  isDeleted: false,
  listingStatus: 'published',
  availabilityStatus: 'available',
} as const;

/** Never expose these fields on public reads. */
const PUBLIC_PROJECTION = '-ownerPhone -internalAdminNotes';

const SORTS: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  price_asc: { rentalPrice: 1 },
  price_desc: { rentalPrice: -1 },
};

/** Apartment ids that currently have a paid, unexpired advertising order. */
async function featuredIds(ids: unknown[]): Promise<Set<string>> {
  const rows = await AdvertisingOrder.find({
    apartmentId: { $in: ids },
    orderStatus: 'active',
    endDate: { $gt: new Date() },
  }).select('apartmentId');
  return new Set(rows.map((r) => String(r.apartmentId)));
}

const CONTACT_REVEAL_LIMIT = 20;
const CONTACT_REVEAL_WINDOW_MS = 60 * 60 * 1000;

/** GET /apartments - public search with allowlisted filters. ownerPhone stripped. */
export async function listApartments(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query as unknown as {
      page: number;
      limit: number;
      sortBy: string;
      governorateId?: string;
      cityId?: string;
      areaId?: string;
      minPrice?: number;
      maxPrice?: number;
      rentalType?: string;
      bedrooms?: number;
      bathrooms?: number;
      floor?: number;
      furnishedStatus?: string;
    };

    const filter: Record<string, unknown> = { ...PUBLIC_LISTING };
    if (q.rentalType) filter.rentalType = q.rentalType;
    if (q.bedrooms) filter.bedrooms = q.bedrooms;
    if (q.bathrooms) filter.bathrooms = q.bathrooms;
    if (q.floor !== undefined) filter.floor = q.floor;
    if (q.furnishedStatus) filter.furnishedStatus = q.furnishedStatus;
    if (q.minPrice !== undefined || q.maxPrice !== undefined) {
      filter.rentalPrice = {
        ...(q.minPrice !== undefined ? { $gte: q.minPrice } : {}),
        ...(q.maxPrice !== undefined ? { $lte: q.maxPrice } : {}),
      };
    }

    // Location filters resolve through the building.
    let buildingIds: Types.ObjectId[] | null = null;
    if (q.governorateId || q.cityId || q.areaId) {
      const bf: Record<string, unknown> = {
        isDeleted: false,
        isArchived: false,
        isActive: true,
      };
      if (q.governorateId) bf.governorateId = q.governorateId;
      if (q.cityId) bf.cityId = q.cityId;
      if (q.areaId) bf.areaId = q.areaId;
      buildingIds = await Building.find(bf).distinct('_id');
      filter.buildingId = { $in: buildingIds };
    }

    const [items, total] = await Promise.all([
      Apartment.find(filter)
        .select(PUBLIC_PROJECTION)
        .populate('buildingId', 'name streetAddress googleMapsUrl governorateId cityId areaId location')
        .sort(SORTS[q.sortBy] ?? SORTS.newest)
        .skip((q.page - 1) * q.limit)
        .limit(q.limit),
      Apartment.countDocuments(filter),
    ]);

    const featured = await featuredIds(items.map((i) => i._id));
    const apartments = items
      .map((i) => ({ ...i.toObject(), isFeatured: featured.has(String(i._id)) }))
      .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)); // stable: featured float up within the page

    res.status(200).json({
      success: true,
      data: {
        apartments,
        pagination: { page: q.page, limit: q.limit, total, pages: Math.ceil(total / q.limit) },
      },
    });
  } catch (err) {
    next(err);
  }
}

/** GET /apartments/:id - public detail. ownerPhone excluded. */
export async function getApartment(req: Request, res: Response, next: NextFunction) {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return next(httpError(404, 'Apartment not found.'));
    const apartment = await Apartment.findOne({ _id: req.params.id, ...PUBLIC_LISTING })
      .select(PUBLIC_PROJECTION)
      .populate('buildingId');
    if (!apartment) return next(httpError(404, 'Apartment not found.'));
    const featured = await featuredIds([apartment._id]);
    res.status(200).json({
      success: true,
      data: { apartment: { ...apartment.toObject(), isFeatured: featured.has(String(apartment._id)) } },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /apartments/:id/contact - protected landlord contact disclosure.
 * Auth + verified + active user, valid listing, 20 reveals/hour, audited.
 */
export async function getApartmentContact(req: Request, res: Response, next: NextFunction) {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return next(httpError(404, 'Apartment not found.'));
    const apartment = await Apartment.findOne({ _id: req.params.id, ...PUBLIC_LISTING });
    if (!apartment) return next(httpError(404, 'Apartment not found.'));

    const since = new Date(Date.now() - CONTACT_REVEAL_WINDOW_MS);
    const reveals = await AuditLog.countDocuments({
      actorId: new Types.ObjectId(req.user!.id),
      action: 'CONTACT_INFO_REVEALED',
      createdAt: { $gte: since },
    });
    if (reveals >= CONTACT_REVEAL_LIMIT) {
      return next(httpError(429, 'Contact reveal limit reached. Try again later.'));
    }

    await AuditLog.create({
      actorId: new Types.ObjectId(req.user!.id),
      actorRole: req.user!.role,
      ipAddress: req.ip ?? 'unknown',
      userAgent: req.get('user-agent')?.slice(0, 250) ?? '',
      action: 'CONTACT_INFO_REVEALED',
      targetEntity: 'Apartment',
      targetId: apartment._id as Types.ObjectId,
      metadata: {},
    });

    const national = apartment.ownerPhone.replace(/^\+20/, '0');
    const displayPhone = national.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3');
    const whatsAppLink = `https://wa.me/${apartment.ownerPhone.replace('+', '')}?text=${encodeURIComponent(
      'مرحبا بخصوص الشقة المعروضة على سُكنا',
    )}`;

    res.status(200).json({
      success: true,
      data: {
        apartmentId: apartment.id,
        ownerName: apartment.ownerName,
        ownerPhone: apartment.ownerPhone,
        displayPhone,
        whatsAppLink,
      },
    });
  } catch (err) {
    next(err);
  }
}

/** POST /apartments - admin. Building must be usable (not archived/deleted). */
export async function createApartment(req: Request, res: Response, next: NextFunction) {
  try {
    const building = await Building.findOne({
      _id: req.body.buildingId,
      isDeleted: false,
    });
    if (!building) return next(httpError(400, 'Building does not exist.'));
    if (building.isArchived) {
      return next(httpError(400, 'Building is archived; it cannot accept new apartments.'));
    }

    const apartment = await Apartment.create(req.body);
    res.status(201).json({ success: true, data: { apartment } });
  } catch (err) {
    next(err);
  }
}

/** PUT /apartments/:id - admin. */
export async function updateApartment(req: Request, res: Response, next: NextFunction) {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return next(httpError(404, 'Apartment not found.'));
    const apartment = await Apartment.findOne({ _id: req.params.id, isDeleted: false });
    if (!apartment) return next(httpError(404, 'Apartment not found.'));
    Object.assign(apartment, req.body);
    await apartment.save();
    res.status(200).json({ success: true, data: { apartment } });
  } catch (err) {
    next(err);
  }
}

/** PATCH /apartments/:id/status - admin listing workflow, audited. */
export async function updateApartmentStatus(req: Request, res: Response, next: NextFunction) {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return next(httpError(404, 'Apartment not found.'));
    const apartment = await Apartment.findOne({ _id: req.params.id, isDeleted: false });
    if (!apartment) return next(httpError(404, 'Apartment not found.'));

    const { listingStatus, rejectionReason, internalAdminNotes } = req.body;
    apartment.listingStatus = listingStatus;
    if (rejectionReason !== undefined) apartment.rejectionReason = rejectionReason;
    if (internalAdminNotes !== undefined) apartment.internalAdminNotes = internalAdminNotes;
    await apartment.save();

    const action =
      listingStatus === 'published'
        ? 'LISTING_PUBLISHED'
        : listingStatus === 'rejected'
          ? 'LISTING_REJECTED'
          : 'LISTING_UNPUBLISHED';
    await AuditLog.create({
      actorId: new Types.ObjectId(req.user!.id),
      actorRole: 'admin',
      ipAddress: req.ip ?? 'unknown',
      userAgent: req.get('user-agent')?.slice(0, 250) ?? '',
      action,
      targetEntity: 'Apartment',
      targetId: apartment._id as Types.ObjectId,
      metadata: { listingStatus },
    });

    res.status(200).json({ success: true, data: { apartment } });
  } catch (err) {
    next(err);
  }
}

/** PATCH /apartments/:id/availability - admin. */
export async function updateApartmentAvailability(req: Request, res: Response, next: NextFunction) {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return next(httpError(404, 'Apartment not found.'));
    const apartment = await Apartment.findOne({ _id: req.params.id, isDeleted: false });
    if (!apartment) return next(httpError(404, 'Apartment not found.'));
    apartment.availabilityStatus = req.body.availabilityStatus;
    await apartment.save();
    res.status(200).json({ success: true, data: { apartment } });
  } catch (err) {
    next(err);
  }
}

/** DELETE /apartments/:id - admin soft delete; orders/payments preserved. */
export async function deleteApartment(req: Request, res: Response, next: NextFunction) {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return next(httpError(404, 'Apartment not found.'));
    const apartment = await Apartment.findOne({ _id: req.params.id, isDeleted: false });
    if (!apartment) return next(httpError(404, 'Apartment not found.'));
    apartment.isDeleted = true;
    apartment.deletedAt = new Date();
    await apartment.save();

    await AuditLog.create({
      actorId: new Types.ObjectId(req.user!.id),
      actorRole: 'admin',
      ipAddress: req.ip ?? 'unknown',
      userAgent: req.get('user-agent')?.slice(0, 250) ?? '',
      action: 'PROPERTY_SOFT_DELETED',
      targetEntity: 'Apartment',
      targetId: apartment._id as Types.ObjectId,
      metadata: { title: apartment.title },
    });

    res.status(200).json({ success: true, message: 'Apartment deleted.' });
  } catch (err) {
    next(err);
  }
}

/** GET /apartments/admin/all - admin moderation list, all statuses, includes owner contact. */
export async function listApartmentsAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const filter: Record<string, unknown> = { isDeleted: false };
    if (req.query.listingStatus) filter.listingStatus = req.query.listingStatus;
    const apartments = await Apartment.find(filter)
      .select('-internalAdminNotes')
      .populate('buildingId', 'name streetAddress governorateId cityId areaId')
      .sort({ createdAt: -1 })
      .limit(500);
    res.status(200).json({ success: true, data: { apartments } });
  } catch (err) {
    next(err);
  }
}
