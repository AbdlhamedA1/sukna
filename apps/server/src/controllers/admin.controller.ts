import type { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import { httpError } from '../middleware/errorHandler.js';
import { AdvertisingOrder } from '../models/AdvertisingOrder.js';
import { Apartment } from '../models/Apartment.js';
import { AuditLog } from '../models/AuditLog.js';
import { Building } from '../models/Building.js';
import { Landmark } from '../models/Landmark.js';
import { coordsFromMapsUrl } from '../utils/geo.js';
import { PaymentRecord } from '../models/PaymentRecord.js';
import { User } from '../models/User.js';

export async function getStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date();
    const [
      buildings,
      apartments,
      published,
      pending,
      users,
      activeOrders,
      pendingOrders,
      revenueAgg,
    ] = await Promise.all([
      Building.countDocuments({ isDeleted: false }),
      Apartment.countDocuments({ isDeleted: false }),
      Apartment.countDocuments({ isDeleted: false, listingStatus: 'published' }),
      Apartment.countDocuments({ isDeleted: false, listingStatus: 'pending' }),
      User.countDocuments({ role: 'user' }),
      AdvertisingOrder.countDocuments({ orderStatus: 'active', endDate: { $gt: now } }),
      AdvertisingOrder.countDocuments({ orderStatus: 'pending' }),
      PaymentRecord.aggregate([{ $group: { _id: null, total: { $sum: '$amountPaid' } } }]),
    ]);
    res.json({
      success: true,
      data: {
        stats: {
          buildings,
          apartments,
          published,
          pending,
          users,
          activeOrders,
          pendingOrders,
          revenue: revenueAgg[0]?.total ?? 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
    const filter: Record<string, unknown> = {};
    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { email: { $regex: safe, $options: 'i' } },
        { fullName: { $regex: safe, $options: 'i' } },
      ];
    }
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('fullName email role isVerified isActive createdAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);
    res.json({
      success: true,
      data: { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
  } catch (err) {
    next(err);
  }
}

export async function setUserStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { isActive } = req.body as { isActive: boolean };
    if (!Types.ObjectId.isValid(id)) throw httpError(404, 'User not found.');
    const target = await User.findById(id);
    if (!target) throw httpError(404, 'User not found.');

    if (!isActive) {
      if (String(target._id) === req.user!.id) {
        throw httpError(400, 'You cannot deactivate your own account.');
      }
      if (target.role === 'admin') {
        const activeAdmins = await User.countDocuments({ role: 'admin', isActive: true });
        if (activeAdmins <= 1) {
          throw httpError(400, 'You cannot deactivate the last active administrator.');
        }
      }
      target.tokenVersion += 1; // revoke live sessions immediately
    }
    target.isActive = isActive;
    await target.save();

    await AuditLog.create({
      actorId: new Types.ObjectId(req.user!.id),
      actorRole: 'admin',
      ipAddress: req.ip ?? 'unknown',
      userAgent: req.get('user-agent')?.slice(0, 250) ?? '',
      action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      targetEntity: 'User',
      targetId: target._id as Types.ObjectId,
      metadata: { email: target.email },
    });
    res.json({ success: true, data: { id: String(target._id), isActive: target.isActive } });
  } catch (err) {
    next(err);
  }
}

export async function listAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
    const filter: Record<string, unknown> = {};
    for (const key of ['action', 'targetEntity'] as const) {
      const v = req.query[key];
      if (typeof v === 'string' && v) filter[key] = v;
    }
    if (typeof req.query.actorId === 'string' && Types.ObjectId.isValid(req.query.actorId)) {
      filter.actorId = req.query.actorId;
    }
    const range: Record<string, Date> = {};
    if (typeof req.query.startDate === 'string') range.$gte = new Date(req.query.startDate);
    if (typeof req.query.endDate === 'string') range.$lte = new Date(req.query.endDate);
    if (Object.keys(range).length) filter.createdAt = range;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('actorId', 'fullName email'),
      AuditLog.countDocuments(filter),
    ]);
    res.json({
      success: true,
      data: { logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
  } catch (err) {
    next(err);
  }
}

export async function listLandmarksAdmin(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: { landmarks: await Landmark.find().sort({ name: 1 }) } });
  } catch (err) {
    next(err);
  }
}

/** Create or update a landmark from a pasted Google Maps link (coordinates are read from it). */
export async function saveLandmark(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, type, mapsUrl, isActive } = req.body as {
      name?: string;
      type?: 'university_gate' | 'other';
      mapsUrl?: string;
      isActive?: boolean;
    };
    const id = req.params.id;
    const doc = id ? await Landmark.findById(id) : new Landmark({});
    if (!doc) throw httpError(404, 'Landmark not found.');
    if (name !== undefined) doc.name = name;
    if (type !== undefined) doc.type = type;
    if (isActive !== undefined) doc.isActive = isActive;
    if (mapsUrl) {
      const c = await coordsFromMapsUrl(mapsUrl);
      if (!c) throw httpError(400, 'Could not read coordinates from that Google Maps link. Open the place in Google Maps and copy the full link.');
      doc.lat = c.lat;
      doc.lng = c.lng;
    } else if (!id) {
      throw httpError(400, 'A Google Maps link is required.');
    }
    await doc.save();
    res.status(id ? 200 : 201).json({ success: true, data: { landmark: doc } });
  } catch (err) {
    next(err);
  }
}
