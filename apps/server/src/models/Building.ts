import { Schema, model, type Document, type Types } from 'mongoose';

import { coordsFromMapsUrl } from '../utils/geo.js';

export interface IBuilding extends Document {
  name: string;
  description: string;
  mainImage: string;
  mainImagePublicId: string;
  additionalImages: string[];
  additionalImagePublicIds: string[];
  governorateId: Types.ObjectId;
  cityId: Types.ObjectId;
  areaId: Types.ObjectId;
  streetAddress: string;
  googleMapsUrl: string;
  location: { lat: number; lng: number } | null;
  services: {
    computedAt: Date;
    counts: Record<string, number>;
    level: 'well_served' | 'some' | 'far';
  } | null;
  isActive: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const GOOGLE_MAPS_URL_REGEX =
  /^https:\/\/(www\.)?(google\.com\/maps|maps\.app\.goo\.gl)\/.+/;

const buildingSchema = new Schema<IBuilding>(
  {
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 150 },
    description: { type: String, default: '', maxlength: 1000 },
    mainImage: { type: String, required: true },
    mainImagePublicId: { type: String, required: true },
    additionalImages: { type: [String], default: [] },
    additionalImagePublicIds: { type: [String], default: [] },
    governorateId: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    cityId: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    areaId: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    streetAddress: { type: String, required: true, trim: true, minlength: 5, maxlength: 250 },
    // External Google Maps deep links only — no embedded map SDKs (ADR-006).
    googleMapsUrl: {
      type: String,
      required: true,
      match: [GOOGLE_MAPS_URL_REGEX, 'Must be a Google Maps URL.'],
    },
    // Derived from googleMapsUrl on save; null when the link carries no coordinates.
    location: { type: new Schema({ lat: Number, lng: Number }, { _id: false }), default: null },
    // Cached nearby-services summary (OpenStreetMap), refreshed lazily.
    services: { type: Schema.Types.Mixed, default: null },
    isActive: { type: Boolean, required: true, default: true },
    isArchived: { type: Boolean, required: true, default: false },
    isDeleted: { type: Boolean, required: true, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

buildingSchema.pre('save', async function resolveLocation() {
  if (this.isNew || this.isModified('googleMapsUrl')) {
    this.location = await coordsFromMapsUrl(this.googleMapsUrl);
    this.services = null;
  }
});

buildingSchema.index({ governorateId: 1, cityId: 1, areaId: 1, isDeleted: 1, isActive: 1 });
buildingSchema.index({ isDeleted: 1, isArchived: 1, isActive: 1 });
buildingSchema.index({ createdAt: -1 });

export const Building = model<IBuilding>('Building', buildingSchema);
