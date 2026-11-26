import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id.');

const packageFields = {
  nameAr: z.string().trim().min(3).max(100),
  nameEn: z.string().trim().min(3).max(100),
  price: z.number().min(0),
  durationDays: z.number().int().min(1).max(365),
  benefits: z.array(z.string().trim().min(1).max(200)).max(15),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  displayOrder: z.number().int(),
};

export const createPackageSchema = z
  .object({
    ...packageFields,
    isFeatured: packageFields.isFeatured.default(false),
    isActive: packageFields.isActive.default(true),
    displayOrder: packageFields.displayOrder.default(0),
  })
  .strict();

export const updatePackageSchema = z.object(packageFields).partial().strict();

export const createOrderSchema = z
  .object({
    apartmentId: objectId,
    packageId: objectId,
    adminNotes: z.string().trim().max(500).optional().default(''),
  })
  .strict();

export const recordPaymentSchema = z
  .object({
    amountPaid: z.number().min(0),
    paymentMethod: z.enum(['instapay', 'vodafone_cash', 'bank_transfer', 'cash']),
    externalTransactionRef: z.string().trim().max(100).optional().default(''),
    paidAt: z.coerce.date().optional(),
    notes: z.string().trim().max(500).optional().default(''),
  })
  .strict();
