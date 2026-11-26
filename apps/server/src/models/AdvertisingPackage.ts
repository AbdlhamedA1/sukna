import { Schema, model, type Document } from 'mongoose';

export interface IAdvertisingPackage extends Document {
  nameAr: string;
  nameEn: string;
  price: number;
  durationDays: number;
  benefits: string[];
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
}

const advertisingPackageSchema = new Schema<IAdvertisingPackage>(
  {
    nameAr: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    nameEn: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    // PLACEHOLDER pricing until commercial approval (ADR-021).
    price: { type: Number, required: true, min: 0 },
    durationDays: { type: Number, required: true, min: 1, max: 365 },
    benefits: { type: [String], required: true, default: [] },
    isFeatured: { type: Boolean, required: true, default: false },
    isActive: { type: Boolean, required: true, default: true },
    displayOrder: { type: Number, required: true, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

export const AdvertisingPackage = model<IAdvertisingPackage>(
  'AdvertisingPackage',
  advertisingPackageSchema,
);
