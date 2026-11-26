import { Schema, model, type Document, type Types } from 'mongoose';

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
    isActive: { type: Boolean, required: true, default: true },
    isArchived: { type: Boolean, required: true, default: false },
    isDeleted: { type: Boolean, required: true, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

buildingSchema.index({ governorateId: 1, cityId: 1, areaId: 1, isDeleted: 1, isActive: 1 });
buildingSchema.index({ isDeleted: 1, isArchived: 1, isActive: 1 });
buildingSchema.index({ createdAt: -1 });

export const Building = model<IBuilding>('Building', buildingSchema);
