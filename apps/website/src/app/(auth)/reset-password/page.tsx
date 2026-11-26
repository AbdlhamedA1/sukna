'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { AuthCard } from '../../../components/auth/AuthCard';
import { FormField } from '../../../components/auth/FormField';
import { OtpInput } from '../../../components/auth/OtpInput';
import { SubmitButton } from '../../../components/auth/SubmitButton';
import { apiFetch } from '../../../lib/api';

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
