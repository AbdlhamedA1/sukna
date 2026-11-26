import mongoose from 'mongoose';

import { env } from './env.js';

/**
 * Establishes the MongoDB connection. The server refuses to boot without a
 * live database because every vertical slice (auth, properties, orders)
 * depends on persistence.
 */
export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.mongodbUri, {
    autoIndex: env.nodeEnv !== 'production',
  });

  // Production keeps autoIndex off to avoid surprise builds, but unique indexes
  // (email, favorites, one payment per order) must exist. createIndexes is idempotent.
  await Promise.all(
    Object.values(mongoose.models).map((m) =>
      m.createIndexes().catch((e: unknown) => console.warn(`[db] index build failed for ${m.modelName}:`, e)),
    ),
  );

  mongoose.connection.on('error', (error) => {
    console.error('[db] MongoDB connection error:', error);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected.');
  });

  console.log(`[db] Connected to MongoDB (${mongoose.connection.name}).`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
