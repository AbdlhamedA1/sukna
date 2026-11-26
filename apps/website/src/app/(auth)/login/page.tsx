'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AuthCard } from '../../../components/auth/AuthCard';
import { FormField } from '../../../components/auth/FormField';
import { SubmitButton } from '../../../components/auth/SubmitButton';
import { apiFetch } from '../../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
        }),
      });
      router.push('/');
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(
        msg && !msg.startsWith('API request failed')
          ? msg
          : 'Login failed. Check your email and password, and make sure your email is verified.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to browse verified housing and manage your favorites."
      footer={
        <>
          New to SUKNA?{' '}
          <Link href="/register" className="font-semibold text-brand-accent hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <FormField label="Email" name="email" type="email" autoComplete="email" required />
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <SubmitButton loading={loading}>Log in</SubmitButton>
        <Link
          href="/forgot-password"
          className="text-center text-sm font-medium text-brand-primary hover:underline"
        >
          Forgot your password?
        </Link>
      </form>
    </AuthCard>
  );
}
