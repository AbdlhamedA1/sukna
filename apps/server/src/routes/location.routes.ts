import { Router } from 'express';

import * as locationController from '../controllers/location.controller.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { csrfHeaderGuard } from '../middleware/csrf.js';
import { validateBody } from '../middleware/validate.js';
import {
  createLocationSchema,
  updateLocationSchema,
} from '../validators/location.validators.js';

export const locationRouter = Router();

// Public tree for the website's cascaded search filters.
locationRouter.get('/tree', locationController.getLocationTree);

// Admin catalog and management.
locationRouter.get('/admin/all', requireAuth, requireAdmin, locationController.listLocationsAdmin);
locationRouter.post(
  '/',
  requireAuth,
  requireAdmin,
  csrfHeaderGuard,
  validateBody(createLocationSchema),
  locationController.createLocation,
);
locationRouter.patch(
  '/:id',
  requireAuth,
  requireAdmin,
  csrfHeaderGuard,
  validateBody(updateLocationSchema),
  locationController.updateLocation,
);
