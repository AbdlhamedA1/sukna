import { Schema, model, type Document, type Types } from 'mongoose';

export type RentalType = 'entire' | 'shared' | 'private_room';
export type FurnishedStatus = 'furnished' | 'semi_furnished' | 'unfurnished';
export type ListingStatus = 'pending' | 'published' | 'rejected' | 'unpublished';
export type AvailabilityStatus = 'available' | 'rented';

export interface IApartment extends Document {
  buildingId: Types.ObjectId;
  title: string;
  description: string;
  rentalPrice: number;
  rentalType: RentalType;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  furnishedStatus: FurnishedStatus;
  images: string[];
  imagePublicIds: string[];
  ownerName: string;
  ownerPhone: string;
  listingStatus: ListingStatus;
  availabilityStatus: AvailabilityStatus;
  rejectionReason: string;
  internalAdminNotes: string;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const E164_REGEX = /^\+[1-9]\d{6,14}$/;

const apartmentSchema = new Schema<IApartment>(
  {
    buildingId: { type: Schema.Types.ObjectId, ref: 'Building', required: true },
    title: { type: String, required: true, trim: true, minlength: 5, maxlength: 150 },
    description: { type: String, required: true, minlength: 20, maxlength: 3000 },
    rentalPrice: { type: Number, required: true, min: 100, max: 500000 },
    rentalType: {
      type: String,
      required: true,
      enum: ['entire', 'shared', 'private_room'],
      default: 'entire',
    },
    bedrooms: { type: Number, required: true, min: 1, max: 15 },
    bathrooms: { type: Number, required: true, min: 1, max: 10 },
    floor: { type: Number, required: true, min: -2, max: 50 },
    furnishedStatus: {
      type: String,
      required: true,
      enum: ['furnished', 'semi_furnished', 'unfurnished'],
      default: 'unfurnished',
    },
    images: {
      type: [String],
      required: true,
      validate: [
        (value: string[]) => value.length >= 1 && value.length <= 15,
        'An apartment must have between 1 and 15 images.',
      ],
    },
    imagePublicIds: { type: [String], required: true },
    ownerName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    // PROTECTED: E.164 format. Never exposed by public APIs (ADR-008).
    ownerPhone: { type: String, required: true, match: [E164_REGEX, 'Must be E.164 format.'] },
    listingStatus: {
      type: String,
      required: true,
      enum: ['pending', 'published', 'rejected', 'unpublished'],
      default: 'pending',
    },
    availabilityStatus: {
      type: String,
      required: true,
      enum: ['available', 'rented'],
      default: 'available',
    },
    // Public-facing explanation shown to the landlord on rejection.
    rejectionReason: { type: String, default: '', maxlength: 500 },
    // Confidential staff-only notes, never sent to landlords.
    internalAdminNotes: { type: String, default: '', maxlength: 1000 },
    isDeleted: { type: Boolean, required: true, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

apartmentSchema.index({ isDeleted: 1, listingStatus: 1, availabilityStatus: 1, rentalPrice: 1 });
apartmentSchema.index({ buildingId: 1, isDeleted: 1, listingStatus: 1 });
apartmentSchema.index({ isDeleted: 1, listingStatus: 1, bedrooms: 1, furnishedStatus: 1 });
apartmentSchema.index({ createdAt: -1 });

export const Apartment = model<IApartment>('Apartment', apartmentSchema);
