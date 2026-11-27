import { Router } from 'express';

import { listLandmarks } from '../controllers/area.controller.js';
import { getHealth } from '../controllers/health.controller.js';
import { adminRouter } from './admin.routes.js';
import { favoriteRouter } from './favorite.routes.js';
import { authRouter } from './auth.routes.js';
import { monetizationRouter } from './monetization.routes.js';
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
apiV1Router.use('/monetization', monetizationRouter);
apiV1Router.use('/favorites', favoriteRouter);
apiV1Router.use('/admin', adminRouter);
apiV1Router.get('/landmarks', listLandmarks);
