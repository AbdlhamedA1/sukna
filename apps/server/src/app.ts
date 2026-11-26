import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { createApp } from './server.js';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`[server] SUKNA API listening on http://localhost:${env.port}/api/v1`);
  });

  const shutdown = (signal: string): void => {
    console.log(`[server] ${signal} received, shutting down...`);
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  console.error('[server] Failed to start:', error);
  process.exit(1);
});
