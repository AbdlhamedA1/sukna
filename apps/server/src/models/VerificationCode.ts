import { Schema, model, type Document } from 'mongoose';

export type VerificationPurpose = 'email_verification' | 'password_reset';

export interface IVerificationCode extends Document {
  email: string;
  codeHmac: string;
  purpose: VerificationPurpose;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
}

const verificationCodeSchema = new Schema<IVerificationCode>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    // HMAC-SHA-256 hex digest of the 6-digit code — plaintext OTPs are
    // strictly prohibited (FR-AUTH-03).
    codeHmac: { type: String, required: true, length: 64 },
    purpose: { type: String, required: true, enum: ['email_verification', 'password_reset'] },
    // Failed verification attempts; locked out at 5 (FR-AUTH-05).
    attempts: { type: Number, required: true, default: 0, min: 0, max: 5 },
    // Exactly 5 minutes from creation.
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

verificationCodeSchema.index({ email: 1, purpose: 1 });
// TTL auto-deletion: MongoDB removes the document at expiresAt.
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const VerificationCode = model<IVerificationCode>(
  'VerificationCode',
  verificationCodeSchema,
);
