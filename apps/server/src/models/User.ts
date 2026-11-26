import { Schema, model, type Document } from 'mongoose';

export type UserRole = 'user' | 'admin';

export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, 'Invalid email format.'],
    },
    // select: false prevents accidental hash leakage in query results.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, required: true, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, required: true, default: false },
    isActive: { type: Boolean, required: true, default: true },
    // Session revocation counter: incrementing invalidates all live JWTs.
    tokenVersion: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true },
);

userSchema.index({ role: 1, isVerified: 1, isActive: 1 });

export const User = model<IUser>('User', userSchema);
