import type { Request, Response } from 'express';

import { env } from '../config/env.js';

export function getHealth(_req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    message: 'SUKNA API is healthy.',
    data: {
      service: '@sukna/server',
      environment: env.nodeEnv,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
}
