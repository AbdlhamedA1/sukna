import { Schema, model, type Document, type Types } from 'mongoose';

export type OrderStatus = 'pending' | 'active' | 'expired' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid';

/** Immutable frozen copy of the package at booking time (ADR-012). */
export interface IPackageSnapshot {
  nameAr: string;
  nameEn: string;
  price: number;
  durationDays: number;
  benefits: string[];
}

export interface IAdvertisingOrder extends Document {
  apartmentId: Types.ObjectId | null;
  packageId: Types.ObjectId;
  packageSnapshot: IPackageSnapshot;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  startDate: Date | null;
  endDate: Date | null;
  adminNotes: string;
  ownerName: string;
  ownerPhone: string;
  propertyNote: string;
  createdAt: Date;
}

const packageSnapshotSchema = new Schema<IPackageSnapshot>(
  {
    nameAr: { type: String, required: true },
    nameEn: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    durationDays: { type: Number, required: true, min: 1 },
    benefits: { type: [String], required: true, default: [] },
  },
  { _id: false },
);

const advertisingOrderSchema = new Schema<IAdvertisingOrder>(
  {
    // Optional: website order requests arrive before the property is identified;
    // the admin assigns the apartment when converting the request.
    apartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment', default: null },
    packageId: { type: Schema.Types.ObjectId, ref: 'AdvertisingPackage', required: true },
    packageSnapshot: { type: packageSnapshotSchema, required: true },
    orderStatus: {
      type: String,
      required: true,
      enum: ['pending', 'active', 'expired', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    adminNotes: { type: String, default: '', maxlength: 500 },
    ownerName: { type: String, trim: true, maxlength: 100, default: '' },
    ownerPhone: { type: String, trim: true, maxlength: 30, default: '' },
    propertyNote: { type: String, trim: true, maxlength: 200, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

advertisingOrderSchema.index({ apartmentId: 1, createdAt: -1 });
advertisingOrderSchema.index({ orderStatus: 1, endDate: 1 });

export const AdvertisingOrder = model<IAdvertisingOrder>(
  'AdvertisingOrder',
  advertisingOrderSchema,
);
