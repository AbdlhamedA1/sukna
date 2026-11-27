'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { AuthCard } from '../../../components/auth/AuthCard';
import { FormField } from '../../../components/auth/FormField';
import { OtpInput } from '../../../components/auth/OtpInput';
import { SubmitButton } from '../../../components/auth/SubmitButton';
import { apiFetch } from '../../../lib/api';
import { whatsappLink } from '../../../lib/contact';

type Step = 'code' | 'password';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const [step, setStep] = useState<Step>('code');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCodeSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await apiFetch<{ data: { resetToken: string } }>('/auth/verify-reset-code', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      });
      setResetToken(result.data.resetToken);
      setStep('password');
    } catch {
      setError('That code did not work. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get('newPassword') ?? '');
    const confirmNewPassword = String(form.get('confirmNewPassword') ?? '');
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, resetToken, newPassword, confirmNewPassword }),
      });
      router.push('/login');
    } catch {
      setError('Could not reset the password. The code may have expired - start over.');
    } finally {
      setLoading(false);
    }
  }

  if (!email) {
    return (
      <AuthCard
        title="Reset your password"
        subtitle="Password reset by email is not available right now."
      >
        <p className="text-sm text-brand-muted">
          Message us on WhatsApp and we will reset your account for you.
        </p>
        <a
          href={whatsappLink('Hi SUKNA, I need help resetting my password.')}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex h-11 cursor-pointer items-center justify-center rounded-lg bg-[#25D366] font-semibold text-white transition hover:opacity-90"
        >
          Message us on WhatsApp
        </a>
        <a href="/login" className="mt-4 inline-block text-sm font-semibold text-brand-primary hover:underline">
          Back to log in
        </a>
      </AuthCard>
    );
  }

  if (step === 'password') {
    return (
      <AuthCard title="Choose a new password" subtitle={`Resetting the password for ${email}.`}>
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4" noValidate>
          <FormField
            label="New password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
          />
          <FormField
            label="Confirm new password"
            name="confirmNewPassword"
            type="password"
            autoComplete="new-password"
            required
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <SubmitButton loading={loading}>Reset password</SubmitButton>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Enter your reset code"
      subtitle={`We sent a 6-digit code to ${email || 'your email'}.`}
    >
      <form onSubmit={handleCodeSubmit} className="flex flex-col gap-5" noValidate>
        <OtpInput onChange={setCode} disabled={loading} />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <SubmitButton loading={loading}>Continue</SubmitButton>
        <p className="text-sm text-brand-muted">
          No code? Email reset is not always available.{' '}
          <a
            href={whatsappLink('Hi SUKNA, I did not get a password reset code.')}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-brand-primary underline"
          >
            Message us on WhatsApp
          </a>
          .
        </p>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
