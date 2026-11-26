import type { UserRole } from '../models/User.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        tokenVersion: number;
        isVerified: boolean;
      };
    }
  }
}

export {};
