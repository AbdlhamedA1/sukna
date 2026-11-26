import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function toInt(value: string, name: string): number {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be an integer, got "${value}"`);
  }
  return parsed;
}

export const env = {
  nodeEnv: required('NODE_ENV', 'development'),
  port: toInt(required('PORT', '5000'), 'PORT'),
  mongodbUri: required('MONGODB_URI'),
  jwtSecret: required('JWT_SECRET'),
  otpSecret: required('OTP_SECRET'),
  bcryptSaltRounds: toInt(required('BCRYPT_SALT_ROUNDS', '12'), 'BCRYPT_SALT_ROUNDS'),
  websiteUrl: required('WEBSITE_URL', 'http://localhost:3000'),
  dashboardUrl: required('DASHBOARD_URL', 'http://localhost:5173'),
  cookieDomain: process.env.COOKIE_DOMAIN,
  isProduction(): boolean {
    return this.nodeEnv === 'production';
  },
} as const;
