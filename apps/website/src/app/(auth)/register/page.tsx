'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AuthCard } from '../../../components/auth/AuthCard';
import { FormField } from '../../../components/auth/FormField';
import { SubmitButton } from '../../../components/auth/SubmitButton';
import { apiFetch } from '../../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') ?? '');
    const confirmPassword = String(form.get('confirmPassword') ?? '');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: form.get('fullName'),
          email: form.get('email'),
          password,
          confirmPassword,
        }),
      });
      router.push(`/verify-email?email=${encodeURIComponent(String(form.get('email')))}`);
    } catch {
      setError('Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="A verification code will be sent to your email."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-accent hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <FormField label="Full name" name="fullName" autoComplete="name" required />
        <FormField label="Email" name="email" type="email" autoComplete="email" required />
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
        <FormField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <SubmitButton loading={loading}>Create account</SubmitButton>
      </form>
    </AuthCard>
  );
}
