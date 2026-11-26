'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { AuthCard } from '../../../components/auth/AuthCard';
import { OtpInput } from '../../../components/auth/OtpInput';
import { SubmitButton } from '../../../components/auth/SubmitButton';
import { apiFetch } from '../../../lib/api';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiFetch('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      });
      router.push('/login');
    } catch {
      setError('That code did not work. Check the code and try again, or request a new one.');
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setError('');
    setNotice('');
    try {
      await apiFetch('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setNotice('A new code is on its way.');
    } catch {
      setError('Could not resend the code right now. Try again in a moment.');
    }
  }

  return (
    <AuthCard
      title="Verify your email"
      subtitle={
        email
          ? `We sent a 6-digit code to ${email}.`
          : 'Enter the 6-digit code we sent to your email.'
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <OtpInput onChange={setCode} disabled={loading} />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {notice ? <p className="text-sm text-green-700">{notice}</p> : null}
        <SubmitButton loading={loading}>Verify email</SubmitButton>
        <button
          type="button"
          onClick={resend}
          className="text-sm font-medium text-brand-primary hover:underline"
        >
          Resend code
        </button>
      </form>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
