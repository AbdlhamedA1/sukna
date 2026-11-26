import { Router } from 'express';

import * as ctrl from '../controllers/favorite.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { csrfHeaderGuard } from '../middleware/csrf.js';

export const favoriteRouter = Router();

// Regular users only: website sessions are user-only by construction (role separation).
favoriteRouter.use(requireAuth);
favoriteRouter.get('/', ctrl.listFavorites);
favoriteRouter.get('/ids', ctrl.listFavoriteIds);
favoriteRouter.post('/:apartmentId', csrfHeaderGuard, ctrl.addFavorite);
favoriteRouter.delete('/:apartmentId', csrfHeaderGuard, ctrl.removeFavorite);
