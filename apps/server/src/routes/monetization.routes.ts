import { Router } from 'express';

import * as ctrl from '../controllers/monetization.controller.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { csrfHeaderGuard } from '../middleware/csrf.js';
import { validateBody } from '../middleware/validate.js';
import {
  createOrderSchema,
  createPackageSchema,
  recordPaymentSchema,
  updatePackageSchema,
} from '../validators/monetization.validators.js';

export const monetizationRouter = Router();

monetizationRouter.get('/packages', ctrl.listPublicPackages);
monetizationRouter.get('/packages/admin/all', requireAuth, requireAdmin, ctrl.listAdminPackages);
monetizationRouter.post(
  '/packages',
  requireAuth,
  requireAdmin,
  csrfHeaderGuard,
  validateBody(createPackageSchema),
  ctrl.createPackage,
);
monetizationRouter.put(
  '/packages/:id',
  requireAuth,
  requireAdmin,
  csrfHeaderGuard,
  validateBody(updatePackageSchema),
  ctrl.updatePackage,
);

monetizationRouter.get('/orders', requireAuth, requireAdmin, ctrl.listOrders);
monetizationRouter.post(
  '/orders',
  requireAuth,
  requireAdmin,
  csrfHeaderGuard,
  validateBody(createOrderSchema),
  ctrl.createOrder,
);
monetizationRouter.get(
  '/apartments/:apartmentId/orders',
  requireAuth,
  requireAdmin,
  ctrl.listApartmentOrders,
);
monetizationRouter.patch(
  '/orders/:orderId/cancel',
  requireAuth,
  requireAdmin,
  csrfHeaderGuard,
  ctrl.cancelOrder,
);
monetizationRouter.post(
  '/orders/:orderId/payments',
  requireAuth,
  requireAdmin,
  csrfHeaderGuard,
  validateBody(recordPaymentSchema),
  ctrl.recordPayment,
);
