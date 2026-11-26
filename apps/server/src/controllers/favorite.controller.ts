import type { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import { httpError } from '../middleware/errorHandler.js';
import { Apartment } from '../models/Apartment.js';
import { Favorite } from '../models/Favorite.js';

const PUBLIC_PROJECTION = '-ownerPhone -internalAdminNotes';
const LIVE = { isDeleted: false, listingStatus: 'published' } as const;

export async function listFavorites(req: Request, res: Response, next: NextFunction) {
  try {
    const favs = await Favorite.find({ userId: req.user!.id }).sort({ createdAt: -1 });
    const apartments = await Apartment.find({
      _id: { $in: favs.map((f) => f.apartmentId) },
      ...LIVE,
    })
      .select(PUBLIC_PROJECTION)
      .populate('buildingId', 'name streetAddress');
    const byId = new Map(apartments.map((a) => [String(a._id), a]));
    // Keep bookmark order; silently skip listings that were unpublished or deleted.
    const items = favs.map((f) => byId.get(String(f.apartmentId))).filter(Boolean);
    res.json({ success: true, data: { apartments: items } });
  } catch (err) {
    next(err);
  }
}

export async function listFavoriteIds(req: Request, res: Response, next: NextFunction) {
  try {
    const favs = await Favorite.find({ userId: req.user!.id }).select('apartmentId');
    res.json({ success: true, data: { ids: favs.map((f) => String(f.apartmentId)) } });
  } catch (err) {
    next(err);
  }
}

export async function addFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    const { apartmentId } = req.params;
    if (!Types.ObjectId.isValid(apartmentId)) throw httpError(404, 'Apartment not found.');
    const apartment = await Apartment.findOne({ _id: apartmentId, ...LIVE });
    if (!apartment) throw httpError(404, 'Apartment not found.');
    try {
      await Favorite.create({ userId: req.user!.id, apartmentId });
    } catch (e) {
      if ((e as { code?: number }).code !== 11000) throw e; // already saved: idempotent
    }
    res.status(201).json({ success: true, message: 'Saved to favorites.' });
  } catch (err) {
    next(err);
  }
}

export async function removeFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    await Favorite.deleteOne({ userId: req.user!.id, apartmentId: req.params.apartmentId });
    res.json({ success: true, message: 'Removed from favorites.' });
  } catch (err) {
    next(err);
  }
}
