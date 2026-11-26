import { env } from './env.js';

/**
 * Transactional email dispatch (ADR-020: provider PENDING, Brevo evaluated).
 *
 * Until the provider account is approved and configured, the mailer runs in
 * development fallback mode: the OTP email content is logged to the server
 * console (never in production) so the full auth flow stays testable.
 * In production without a configured provider, dispatch throws so the
 * caller can surface a retriable error (60-second resend cooldown applies).
 *
 * Delivery invariants (docs/SYSTEM_ARCHITECTURE.md §6):
 *  - dispatched asynchronously (non-blocking),
 *  - branded templates in the SUKNA warm palette,
 *  - OTPs expire in 5 minutes regardless of transit delay.
 */
export interface OtpEmailPayload {
  to: string;
  code: string;
  purpose: 'email_verification' | 'password_reset';
}

export async function sendOtpEmail(payload: OtpEmailPayload): Promise<void> {
  if (env.isProduction()) {
    // Provider integration lands with ADR-020 approval.
    throw new Error('Transactional email provider is not configured yet.');
  }

  const subject =
    payload.purpose === 'email_verification'
      ? 'SUKNA — Verify your email'
      : 'SUKNA — Reset your password';

  // Development fallback only: prints the code so local testing can proceed
  // without an email account. Never log codes in production.
  console.log(
    `[mailer:dev] To: ${payload.to} | Subject: ${subject} | OTP: ${payload.code} (valid 5 minutes)`,
  );
}

/** Fire-and-forget dispatch that never blocks the API response. */
export function dispatchOtpEmail(payload: OtpEmailPayload): void {
  sendOtpEmail(payload).catch((error) => {
    console.error('[mailer] OTP dispatch failed:', error);
  });
}
