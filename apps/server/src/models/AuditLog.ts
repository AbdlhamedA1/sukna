import { Schema, model, type Document, type Types } from 'mongoose';

export const AUDIT_ACTIONS = [
  'PROPERTY_CREATED',
  'PROPERTY_UPDATED',
  'LISTING_PUBLISHED',
  'LISTING_UNPUBLISHED',
  'LISTING_REJECTED',
  'PROPERTY_ARCHIVED',
  'PROPERTY_SOFT_DELETED',
  'LOCATION_TIER_CREATED',
  'LOCATION_TIER_UPDATED',
  'LOCATION_TIER_TOGGLED',
  'PAYMENT_CONFIRMED',
  'PAYMENT_REJECTED',
  'ADVERTISING_ORDER_CREATED',
  'ADVERTISING_ORDER_CANCELLED',
  'USER_ACTIVATED',
  'USER_DEACTIVATED',
  'CONTACT_INFO_REVEALED',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export type AuditTargetEntity =
  | 'Building'
  | 'Apartment'
  | 'Location'
  | 'AdvertisingPackage'
  | 'AdvertisingOrder'
  | 'PaymentRecord'
  | 'User';

export interface IAuditLog extends Document {
  actorId: Types.ObjectId;
  actorRole: 'admin' | 'user' | 'system';
  ipAddress: string;
  userAgent: string;
  action: AuditAction;
  targetEntity: AuditTargetEntity;
  targetId: Types.ObjectId | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    actorRole: { type: String, required: true, enum: ['admin', 'user', 'system'] },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, default: '', maxlength: 250 },
    action: { type: String, required: true, enum: AUDIT_ACTIONS },
    targetEntity: {
      type: String,
      required: true,
      enum: [
        'Building',
        'Apartment',
        'Location',
        'AdvertisingPackage',
        'AdvertisingOrder',
        'PaymentRecord',
        'User',
      ],
    },
    targetId: { type: Schema.Types.ObjectId, default: null },
    // STRICT INVARIANT: metadata must never contain passwords, password
    // hashes, OTPs (plain or hashed), JWTs, or authorization headers.
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ targetEntity: 1, targetId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
