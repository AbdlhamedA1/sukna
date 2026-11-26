import bcrypt from 'bcrypt';
import readline from 'node:readline/promises';

import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

/**
 * Offline CLI admin provisioning (ADR-011 / FR-AUTH-10).
 * Public admin registration is strictly prohibited; the first administrator
 * is seeded here from .env secrets. The script is idempotent: re-running it
 * with an existing admin email reports the existing account instead of
 * creating a duplicate.
 *
 * Usage:
 *   cp .env.example .env   # set ADMIN_FULL_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
 *   npm run seed:admin
 */
async function seedAdmin(): Promise<void> {
  const fullName = process.env.ADMIN_FULL_NAME?.trim() || 'SUKNA Admin';
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('ADMIN_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }

  await connectDatabase();

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`[seed] An account with ${email} already exists (role: ${existing.role}).`);
    console.log('[seed] No changes made. The script is idempotent by design.');
    return;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(
    `Create admin account "${fullName}" <${email}>? Type "yes" to confirm: `,
  );
  rl.close();

  if (answer.trim().toLowerCase() !== 'yes') {
    console.log('[seed] Aborted. No admin created.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);

  const admin = await User.create({
    fullName,
    email,
    passwordHash,
    role: 'admin',
    isVerified: true,
    isActive: true,
    tokenVersion: 0,
  });

  console.log(`[seed] Admin provisioned: ${admin.email} (id: ${admin.id})`);
  console.log('[seed] Remove ADMIN_PASSWORD from .env after first login and password change.');
}

seedAdmin()
  .catch((error) => {
    console.error('[seed] Failed:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void disconnectDatabase();
  });
