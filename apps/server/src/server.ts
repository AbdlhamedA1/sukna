import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';

import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { apiV1Router } from './routes/index.js';

/**
 * Builds the Express application. Separated from the bootstrap so future
 * integration tests (Supertest) can import the app without binding a port.
 */
export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // CORS gatekeeper: only the Website and Dashboard origins may send
  // credentialed (cookie-bearing) requests, per docs/SECURITY_PLAN.md.
  app.use(
    cors({
      origin: [env.websiteUrl, env.dashboardUrl],
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use('/api/v1', apiV1Router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
