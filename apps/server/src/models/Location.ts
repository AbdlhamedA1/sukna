import { Schema, model, type Document, type Types } from 'mongoose';

export type LocationType = 'governorate' | 'city' | 'area';

export interface ILocation extends Document {
  nameAr: string;
  nameEn: string;
  type: LocationType;
  parentId: Types.ObjectId | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
}

const locationSchema = new Schema<ILocation>(
  {
    nameAr: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    nameEn: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    type: { type: String, required: true, enum: ['governorate', 'city', 'area'] },
    // Adjacency-list parent pointer: null for governorates, required for
    // cities and areas. Parent-child consistency is enforced in the service
    // layer (Phase 4), rejected with HTTP 400 on mismatch.
    parentId: { type: Schema.Types.ObjectId, ref: 'Location', default: null },
    isActive: { type: Boolean, required: true, default: true },
    displayOrder: { type: Number, required: true, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

locationSchema.index({ parentId: 1, isActive: 1 });
locationSchema.index({ type: 1, isActive: 1, displayOrder: 1 });

export const Location = model<ILocation>('Location', locationSchema);
