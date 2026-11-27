import { Schema, model, type Document } from 'mongoose';

export interface ILandmark extends Document {
  name: string;
  type: 'university_gate' | 'other';
  lat: number;
  lng: number;
  isActive: boolean;
}

const landmarkSchema = new Schema<ILandmark>(
  {
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    type: { type: String, enum: ['university_gate', 'other'], default: 'university_gate' },
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Landmark = model<ILandmark>('Landmark', landmarkSchema);
