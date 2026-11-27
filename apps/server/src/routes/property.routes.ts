import { Router } from 'express';

import * as apartmentController from '../controllers/apartment.controller.js';
import * as areaController from '../controllers/area.controller.js';
import * as buildingController from '../controllers/building.controller.js';
import { requireAdmin, requireAuth, requireVerified } from '../middleware/auth.js';
import { csrfHeaderGuard } from '../middleware/csrf.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import {
  apartmentAvailabilitySchema,
  apartmentQuerySchema,
  apartmentStatusSchema,
  buildingQuerySchema,
  createApartmentSchema,
  createBuildingSchema,
  updateApartmentSchema,
  updateBuildingSchema,
} from '../validators/property.validators.js';

export const buildingRouter = Router();
export const apartmentRouter = Router();

// ---- Buildings ----
buildingRouter.get('/', validateQuery(buildingQuerySchema), buildingController.listBuildings);
buildingRouter.get('/admin/all', requireAuth, requireAdmin, buildingController.listBuildingsAdmin);
buildingRouter.get('/:id/area', areaController.getBuildingArea);
buildingRouter.get('/:id', buildingController.getBuilding);
buildingRouter.post(
  '/',
  requireAuth,
  requireAdmin,
  csrfHeaderGuard,
  validateBody(createBuildingSchema),
  buildingController.createBuilding,
);
buildingRouter.put(
  '/:id',
  requireAuth,
  requireAdmin,
  csrfHeaderGuard,
  validateBody(updateBuildingSchema),
  buildingController.updateBuilding,
);
buildingRouter.patch(
  '/:id/archive',
  requireAuth,
  requireAdmin,
  csrfHeaderGuard,
  buildingController.archiveBuilding,
);
buildingRouter.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  csrfHeaderGuard,
  buildingController.deleteBuilding,
);

// ---- Apartments ----
apartmentRouter.get('/', validateQuery(apartmentQuerySchema), apartmentController.listApartments);
apartmentRouter.get('/admin/all', requireAuth, requireAdmin, apartmentController.listApartmentsAdmin);
apartmentRouter.get('/:id', apartmentController.getApartment);
apartmentRouter.get(
  '/:id/contact',
  requireAuth,
  requireVerified,
  apartmentController.getApartmentContact,
);
apartmentRouter.post(
  '/',
  requireAuth,
  requireAdmin,
  csrfHeaderGuard,
  validateBody(createApartmentSchema),
  apartmentController.createApartment,
);
apartmentRouter.put(
  '/:id',
  requireAuth,
  requireAdmin,
  csrfHeaderGuard,
  validateBody(updateApartmentSchema),
  apartmentController.updateApartment,
);
apartmentRouter.patch(
  '/:id/status',
  requireAuth,
  requireAdmin,
  csrfHeaderGuard,
  validateBody(apartmentStatusSchema),
  apartmentController.updateApartmentStatus,
);
apartmentRouter.patch(
  '/:id/availability',
  requireAuth,
  requireAdmin,
  csrfHeaderGuard,
  validateBody(apartmentAvailabilitySchema),
  apartmentController.updateApartmentAvailability,
);
apartmentRouter.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  csrfHeaderGuard,
  apartmentController.deleteApartment,
);
