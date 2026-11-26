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
