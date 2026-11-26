import { Schema, model, type Document, type Types } from 'mongoose';

export type PaymentMethod = 'instapay' | 'vodafone_cash' | 'bank_transfer' | 'cash';

export interface IPaymentRecord extends Document {
  orderId: Types.ObjectId;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  externalTransactionRef: string;
  paidAt: Date;
  recordedByAdminId: Types.ObjectId;
  notes: string;
  createdAt: Date;
}

const paymentRecordSchema = new Schema<IPaymentRecord>(
  {
    // Unique index: strictly one full payment per order in the MVP (FR-MON-04).
    orderId: { type: Schema.Types.ObjectId, ref: 'AdvertisingOrder', required: true },
    amountPaid: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['instapay', 'vodafone_cash', 'bank_transfer', 'cash'],
      default: 'instapay',
    },
    externalTransactionRef: { type: String, default: '', maxlength: 100 },
    paidAt: { type: Date, required: true, default: Date.now },
    recordedByAdminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

paymentRecordSchema.index({ orderId: 1 }, { unique: true });
paymentRecordSchema.index({ recordedByAdminId: 1, createdAt: -1 });

export const PaymentRecord = model<IPaymentRecord>('PaymentRecord', paymentRecordSchema);
