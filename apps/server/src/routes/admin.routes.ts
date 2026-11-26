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
