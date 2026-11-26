import type { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';

import { httpError } from '../middleware/errorHandler.js';
import { AdvertisingOrder } from '../models/AdvertisingOrder.js';
import { AdvertisingPackage } from '../models/AdvertisingPackage.js';
import { Apartment } from '../models/Apartment.js';
import { AuditLog, type AuditAction, type AuditTargetEntity } from '../models/AuditLog.js';
import { PaymentRecord } from '../models/PaymentRecord.js';

const DAY_MS = 24 * 60 * 60 * 1000;

async function audit(
  req: Request,
  action: AuditAction,
  targetEntity: AuditTargetEntity,
  targetId: unknown,
  metadata: Record<string, unknown>,
) {
  await AuditLog.create({
    actorId: new Types.ObjectId(req.user!.id),
    actorRole: 'admin',
    ipAddress: req.ip ?? 'unknown',
    userAgent: req.get('user-agent')?.slice(0, 250) ?? '',
    action,
    targetEntity,
    targetId: targetId as Types.ObjectId,
    metadata,
  });
}

/** Marks active orders whose endDate has passed as expired (lazy expiry scan). */
async function expireOverdueOrders() {
  await AdvertisingOrder.updateMany(
    { orderStatus: 'active', endDate: { $lt: new Date() } },
    { $set: { orderStatus: 'expired' } },
  );
}

// ---- Packages ----
export async function listPublicPackages(_req: Request, res: Response, next: NextFunction) {
  try {
    const packages = await AdvertisingPackage.find({ isActive: true }).sort({
      displayOrder: 1,
      price: 1,
    });
    res.json({ success: true, data: { packages } });
  } catch (err) {
    next(err);
  }
}

export async function listAdminPackages(_req: Request, res: Response, next: NextFunction) {
  try {
    const packages = await AdvertisingPackage.find().sort({ displayOrder: 1, price: 1 });
    res.json({ success: true, data: { packages } });
  } catch (err) {
    next(err);
  }
}

export async function createPackage(req: Request, res: Response, next: NextFunction) {
  try {
    const pkg = await AdvertisingPackage.create(req.body);
    await audit(req, 'PROPERTY_CREATED', 'AdvertisingPackage', pkg._id, { nameEn: pkg.nameEn });
    res.status(201).json({ success: true, data: { package: pkg } });
  } catch (err) {
    next(err);
  }
}

export async function updatePackage(req: Request, res: Response, next: NextFunction) {
  try {
    const pkg = await AdvertisingPackage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pkg) throw httpError(404, 'Package not found.');
    // Existing orders keep their frozen packageSnapshot: nothing else is touched here.
    await audit(req, 'PROPERTY_UPDATED', 'AdvertisingPackage', pkg._id, {
      changed: Object.keys(req.body),
    });
    res.json({ success: true, data: { package: pkg } });
  } catch (err) {
    next(err);
  }
}

// ---- Orders ----
export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { apartmentId, packageId, adminNotes } = req.body;
    const [apartment, pkg] = await Promise.all([
      Apartment.findOne({ _id: apartmentId, isDeleted: false }),
      AdvertisingPackage.findById(packageId),
    ]);
    if (!apartment) throw httpError(404, 'Apartment not found.');
    if (!pkg) throw httpError(404, 'Package not found.');
    if (!pkg.isActive) throw httpError(400, 'This package is not available for new orders.');

    const order = await AdvertisingOrder.create({
      apartmentId,
      packageId,
      packageSnapshot: {
        nameAr: pkg.nameAr,
        nameEn: pkg.nameEn,
        price: pkg.price,
        durationDays: pkg.durationDays,
        benefits: [...pkg.benefits],
      },
      adminNotes,
      orderStatus: 'pending',
      paymentStatus: 'unpaid',
    });
    await audit(req, 'ADVERTISING_ORDER_CREATED', 'AdvertisingOrder', order._id, {
      apartmentId,
      packageId,
      price: pkg.price,
    });
    res.status(201).json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
}

export async function listOrders(_req: Request, res: Response, next: NextFunction) {
  try {
    await expireOverdueOrders();
    const orders = await AdvertisingOrder.find()
      .sort({ createdAt: -1 })
      .limit(500)
      .populate('apartmentId', 'title');
    const payments = await PaymentRecord.find({ orderId: { $in: orders.map((o) => o._id) } });
    const byOrder = new Map(payments.map((p) => [String(p.orderId), p]));
    res.json({
      success: true,
      data: {
        orders: orders.map((o) => ({ ...o.toObject(), payment: byOrder.get(String(o._id)) ?? null })),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listApartmentOrders(req: Request, res: Response, next: NextFunction) {
  try {
    await expireOverdueOrders();
    const orders = await AdvertisingOrder.find({ apartmentId: req.params.apartmentId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: { orders } });
  } catch (err) {
    next(err);
  }
}

export async function cancelOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await AdvertisingOrder.findById(req.params.orderId);
    if (!order) throw httpError(404, 'Order not found.');
    if (order.paymentStatus === 'paid') throw httpError(409, 'A paid order cannot be cancelled.');
    if (order.orderStatus === 'cancelled') throw httpError(409, 'Order is already cancelled.');
    order.orderStatus = 'cancelled';
    await order.save();
    await audit(req, 'ADVERTISING_ORDER_CANCELLED', 'AdvertisingOrder', order._id, {});
    res.json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
}

export async function recordPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await AdvertisingOrder.findById(req.params.orderId);
    if (!order) throw httpError(404, 'Order not found.');
    if (order.orderStatus === 'cancelled') throw httpError(409, 'Order is cancelled.');
    if (order.paymentStatus === 'paid') throw httpError(409, 'Order is already paid.');

    const { amountPaid, paymentMethod, externalTransactionRef, paidAt, notes } = req.body;
    if (amountPaid !== order.packageSnapshot.price) {
      throw httpError(
        400,
        `Amount must match the order price (${order.packageSnapshot.price} EGP).`,
        [{ field: 'amountPaid', message: 'Must equal the package price at booking time.' }],
      );
    }

    // Unique index on orderId enforces one full settlement per order (race-safe).
    let payment;
    try {
      payment = await PaymentRecord.create({
        orderId: order._id,
        amountPaid,
        paymentMethod,
        externalTransactionRef,
        paidAt: paidAt ?? new Date(),
        recordedByAdminId: new Types.ObjectId(req.user!.id),
        notes,
      });
    } catch (e) {
      if ((e as { code?: number }).code === 11000) {
        throw httpError(409, 'A payment is already recorded for this order.');
      }
      throw e;
    }

    const start = new Date();
    order.paymentStatus = 'paid';
    order.orderStatus = 'active';
    order.startDate = start;
    order.endDate = new Date(start.getTime() + order.packageSnapshot.durationDays * DAY_MS);
    await order.save();

    await audit(req, 'PAYMENT_CONFIRMED', 'PaymentRecord', payment._id, {
      orderId: String(order._id),
      amountPaid,
      paymentMethod,
      externalTransactionRef,
    });
    res.status(201).json({ success: true, data: { order, payment } });
  } catch (err) {
    next(err);
  }
}
