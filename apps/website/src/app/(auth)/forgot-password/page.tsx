'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AuthCard } from '../../../components/auth/AuthCard';
import { FormField } from '../../../components/auth/FormField';
import { SubmitButton } from '../../../components/auth/SubmitButton';
import { apiFetch } from '../../../lib/api';
import { whatsappLink } from '../../../lib/contact';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const email = String(new FormData(event.currentTarget).get('email') ?? '');
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (e) {
      setError(e instanceof Error && !e.message.startsWith('API request failed') ? e.message : 'Something went wrong. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email to request a password reset."
      footer={
        <Link href="/login" className="font-semibold text-brand-primary hover:underline">
          Back to log in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <FormField label="Email" name="email" type="email" autoComplete="email" required />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {error.includes('WhatsApp') ? (
          <a href={whatsappLink('Hi SUKNA, I forgot my password and need help with my account.')} target="_blank" rel="noreferrer" className="flex h-11 cursor-pointer items-center justify-center rounded-lg bg-[#25D366] font-semibold text-white transition hover:opacity-90">
            Message us on WhatsApp
          </a>
        ) : null}
        <SubmitButton loading={loading}>Send reset code</SubmitButton>
      </form>
    </AuthCard>
  );
}
