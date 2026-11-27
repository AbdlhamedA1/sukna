import { Router } from 'express';
import { z } from 'zod';

import * as ctrl from '../controllers/admin.controller.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { csrfHeaderGuard } from '../middleware/csrf.js';
import { validateBody } from '../middleware/validate.js';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);
adminRouter.get('/stats', ctrl.getStats);
adminRouter.get('/users', ctrl.listUsers);
adminRouter.patch(
  '/users/:id/status',
  csrfHeaderGuard,
  validateBody(z.object({ isActive: z.boolean() }).strict()),
  ctrl.setUserStatus,
);
adminRouter.get('/audit-logs', ctrl.listAuditLogs);

const landmarkBody = z
  .object({
    name: z.string().trim().min(3).max(120).optional(),
    type: z.enum(['university_gate', 'other']).optional(),
    mapsUrl: z.string().url().max(500).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();
adminRouter.get('/landmarks', ctrl.listLandmarksAdmin);
adminRouter.post('/landmarks', csrfHeaderGuard, validateBody(landmarkBody), ctrl.saveLandmark);
adminRouter.put('/landmarks/:id', csrfHeaderGuard, validateBody(landmarkBody), ctrl.saveLandmark);
