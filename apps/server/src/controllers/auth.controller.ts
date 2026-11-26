import bcrypt from 'bcrypt';
import type { NextFunction, Request, Response } from 'express';

import { env } from '../config/env.js';
import { dispatchOtpEmail } from '../config/mailer.js';
import { httpError } from '../middleware/errorHandler.js';
import { User } from '../models/User.js';
import { VerificationCode, type VerificationPurpose } from '../models/VerificationCode.js';
import { clearAuthCookie, setAuthCookie } from '../utils/cookies.js';
import { signResetToken, signSessionToken, verifyResetToken } from '../utils/jwt.js';
import {
  generateOtpCode,
  hashOtpCode,
  verifyOtpCode,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
  OTP_TTL_MS,
} from '../utils/otp.js';

function publicUser(user: {
  _id: unknown;
  fullName: string;
  email: string;
  role: string;
  isVerified: boolean;
}) {
  return {
    id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };
}

/** Issues a fresh OTP: destroys any pending code, stores the HMAC, dispatches email. */
async function issueOtp(email: string, purpose: VerificationPurpose): Promise<string> {
  // Only one active code per email + purpose (FR-AUTH-05).
  await VerificationCode.deleteMany({ email, purpose });

  const code = generateOtpCode();
  await VerificationCode.create({
    email,
    purpose,
    codeHmac: hashOtpCode(email, purpose, code),
    attempts: 0,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });

  dispatchOtpEmail({ to: email, code, purpose });
  return code;
}

/**
 * Validates a presented OTP. Enforces the 5-attempt lockout (forced
 * destruction on the 5th failure) and expiry. Returns true on success.
 */
async function consumeOtp(
  email: string,
  purpose: VerificationPurpose,
  code: string,
): Promise<void> {
  const record = await VerificationCode.findOne({ email, purpose });
  if (!record) throw httpError(400, 'No active code. Please request a new one.');
  if (record.expiresAt.getTime() < Date.now()) {
    await record.deleteOne();
    throw httpError(400, 'Code has expired. Please request a new one.');
  }
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    await record.deleteOne();
    throw httpError(400, 'Too many failed attempts. Please request a new code.');
  }

  if (!verifyOtpCode(email, purpose, code, record.codeHmac)) {
    record.attempts += 1;
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      await record.deleteOne();
      throw httpError(400, 'Too many failed attempts. Please request a new code.');
    }
    await record.save();
    throw httpError(400, 'Invalid verification code.');
  }

  await record.deleteOne();
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { fullName, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      throw httpError(409, 'Email is already registered.', [
        { field: 'email', message: 'Email is already registered.' },
      ]);

    const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);
    // Public registration unconditionally provisions role: 'user' (FR-AUTH-10).
    await User.create({ fullName, email, passwordHash, role: 'user' });

    await issueOtp(email, 'email_verification');

    res.status(201).json({
      success: true,
      message: 'Account created. A 6-digit verification code was sent to your email.',
      data: { email, expiresInSeconds: OTP_TTL_MS / 1000 },
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw httpError(400, 'Invalid verification request.');

    await consumeOtp(email, 'email_verification', code);

    user.isVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
      data: { isVerified: true },
    });
  } catch (error) {
    next(error);
  }
}

export async function resendVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;

    const latest = await VerificationCode.findOne({
      email,
      purpose: 'email_verification',
    }).sort({ createdAt: -1 });

    if (latest && Date.now() - latest.createdAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
      throw httpError(429, 'Please wait 60 seconds before requesting a new code.');
    }

    await issueOtp(email, 'email_verification');

    res.status(200).json({ success: true, message: 'A new verification code was sent.' });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    // Uniform 401 for unknown email and wrong password (no enumeration).
    if (!user) throw httpError(401, 'Invalid email or password.');

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) throw httpError(401, 'Invalid email or password.');

    if (!user.isVerified) throw httpError(403, 'Please verify your email before logging in.');
    if (!user.isActive) throw httpError(403, 'Account is deactivated.');

    const token = signSessionToken({
      sub: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: { user: publicUser(user) },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    // Incrementing tokenVersion invalidates every live session token (FR-AUTH-08).
    await User.findByIdAndUpdate(req.user!.id, { $inc: { tokenVersion: 1 } });
    clearAuthCookie(res);
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) throw httpError(404, 'User not found.');
    res.status(200).json({ success: true, data: { user: publicUser(user) } });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;

    // Generic success response regardless of account existence (FR-AUTH-09).
    const user = await User.findOne({ email });
    if (user) {
      await issueOtp(email, 'password_reset');
    }

    res.status(200).json({
      success: true,
      message: 'If this email is registered, a password reset code has been sent.',
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyResetCode(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw httpError(400, 'Invalid verification request.');

    await consumeOtp(email, 'password_reset', code);

    const resetToken = signResetToken({ sub: user.id, email: user.email, type: 'password_reset' });
    res.status(200).json({ success: true, data: { resetToken } });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, resetToken, newPassword } = req.body;

    let payload;
    try {
      payload = verifyResetToken(resetToken);
    } catch {
      throw httpError(401, 'Reset token is invalid or expired.');
    }
    if (payload.email !== email) throw httpError(400, 'Reset token does not match this email.');

    const user = await User.findById(payload.sub);
    if (!user) throw httpError(404, 'User not found.');

    user.passwordHash = await bcrypt.hash(newPassword, env.bcryptSaltRounds);
    // Invalidate all existing sessions after a password reset (FR-AUTH-08).
    user.tokenVersion += 1;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user!.id).select('+passwordHash');
    if (!user) throw httpError(404, 'User not found.');

    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) throw httpError(401, 'Current password is incorrect.');

    user.passwordHash = await bcrypt.hash(newPassword, env.bcryptSaltRounds);
    user.tokenVersion += 1;
    await user.save();

    clearAuthCookie(res);
    res.status(200).json({ success: true, message: 'Password changed. Please log in again.' });
  } catch (error) {
    next(error);
  }
}
