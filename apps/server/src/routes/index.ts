import { Router } from 'express';

import { getHealth } from '../controllers/health.controller.js';
import { authRouter } from './auth.routes.js';
import { locationRouter } from './location.routes.js';
import { apartmentRouter, buildingRouter } from './property.routes.js';

/**
 * API v1 root router. Domain routers (auth, properties, locations,
 * monetization, users, audit) mount here in their vertical slices.
 */
export const apiV1Router = Router();

apiV1Router.get('/health', getHealth);
apiV1Router.use('/auth', authRouter);
apiV1Router.use('/locations', locationRouter);
apiV1Router.use('/buildings', buildingRouter);
apiV1Router.use('/apartments', apartmentRouter);
