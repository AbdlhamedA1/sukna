import { Schema, model, type Document, type Types } from 'mongoose';

export interface IFavorite extends Document {
  userId: Types.ObjectId;
  apartmentId: Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    apartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Compound unique index strictly prevents duplicate bookmarks (FR-FAV-03).
favoriteSchema.index({ userId: 1, apartmentId: 1 }, { unique: true });
favoriteSchema.index({ userId: 1, createdAt: -1 });

export const Favorite = model<IFavorite>('Favorite', favoriteSchema);
