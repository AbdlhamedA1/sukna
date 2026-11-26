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

function renderOtpEmail(payload: OtpEmailPayload) {
  const isVerify = payload.purpose === 'email_verification';
  const subject = isVerify ? 'SUKNA - Verify your email' : 'SUKNA - Reset your password';
  const intro = isVerify
    ? 'Use this code to verify your email address.'
    : 'Use this code to reset your password.';
  const html = `<!doctype html><html><body style="margin:0;background:#F7F5F0;font-family:Inter,Arial,sans-serif;color:#252B28">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border:1px solid #E5E2DA;border-radius:16px;overflow:hidden">
<tr><td style="background:#123B35;padding:24px;text-align:center;color:#fff;font-size:22px;font-weight:700">SUKNA</td></tr>
<tr><td style="padding:32px 28px">
<p style="margin:0 0 16px;font-size:16px">${intro}</p>
<p style="margin:0 0 20px;font-size:36px;letter-spacing:10px;font-weight:700;color:#123B35;text-align:center">${payload.code}</p>
<p style="margin:0;font-size:13px;color:#5A6460">This code expires in 5 minutes. If you did not request it, you can ignore this email.</p>
</td></tr></table></td></tr></table></body></html>`;
  const text = `${intro}\n\nYour code: ${payload.code}\n\nIt expires in 5 minutes. If you did not request it, ignore this email.`;
  return { subject, html, text };
}

export async function sendOtpEmail(payload: OtpEmailPayload): Promise<void> {
  const { subject, html, text } = renderOtpEmail(payload);
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.MAIL_FROM_EMAIL;

  if (apiKey && senderEmail) {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: process.env.MAIL_FROM_NAME || 'SUKNA', email: senderEmail },
        to: [{ email: payload.to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });
    if (!response.ok) {
      throw new Error(`Brevo send failed: ${response.status}`);
    }
    return;
  }

  if (env.isProduction()) {
    throw new Error('Transactional email provider is not configured.');
  }

  // Development fallback only: prints the code so local testing works without a provider.
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
