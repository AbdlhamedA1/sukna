'use client';

import { useEffect, useState } from 'react';

import { FormField } from '../../components/auth/FormField';
import { SubmitButton } from '../../components/auth/SubmitButton';
import { apiFetch } from '../../lib/api';
import { logoutAndGoHome, useSession } from '../../lib/session';

export default function ProfilePage() {
  const user = useSession();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user === null) window.location.href = '/login';
  }, [user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    if (form.get('newPassword') !== form.get('confirmNewPassword')) {
      setError('New passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: form.get('currentPassword'),
          newPassword: form.get('newPassword'),
          confirmNewPassword: form.get('confirmNewPassword'),
        }),
      });
      window.location.href = '/login';
    } catch (err) {
      setError(
        err instanceof Error && !err.message.startsWith('API request failed')
          ? err.message
          : 'Could not change the password. Check the details and try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-brand-surface">
      <header className="border-b border-brand-border bg-white">
        <div className="mx-auto flex w-full max-w-container items-center justify-between px-4 py-4 sm:px-8">
          <a href="/" className="text-xl font-bold text-brand-primary">
            SUKNA <span className="font-arabic">سُكنا</span>
          </a>
          <a href="/apartments" className="text-sm font-semibold text-brand-primary hover:underline">
            Browse homes
          </a>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-container gap-6 px-4 py-10 sm:px-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-brand-border bg-white p-6">
          <h1 className="text-2xl font-bold text-brand-primary">Your profile</h1>
          {user ? (
            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-brand-muted">Full name</dt>
                <dd className="mt-0.5 font-semibold text-brand-ink">{user.fullName}</dd>
              </div>
              <div>
                <dt className="text-brand-muted">Email</dt>
                <dd className="mt-0.5 font-semibold text-brand-ink">{user.email}</dd>
              </div>
              <div>
                <dt className="text-brand-muted">Email status</dt>
                <dd className="mt-0.5">
                  <span className="rounded-full bg-brand-primary-soft px-3 py-1 text-xs font-semibold text-brand-primary">
                    {user.isVerified ? 'Verified' : 'Not verified'}
                  </span>
                </dd>
              </div>
            </dl>
          ) : (
            <div className="mt-6 h-32 animate-pulse rounded-lg bg-brand-surface" />
          )}
          <button
            type="button"
            onClick={logoutAndGoHome}
            className="mt-8 h-11 rounded-lg border border-brand-border px-5 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary-soft"
          >
            Log out
          </button>
        </section>

        <section className="rounded-2xl border border-brand-border bg-white p-6">
          <h2 className="text-xl font-bold text-brand-primary">Change password</h2>
          <p className="mt-1 text-sm text-brand-muted">
            You will be signed out afterwards and can log in with the new password.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
            <FormField label="Current password" name="currentPassword" type="password" autoComplete="current-password" required />
            <FormField label="New password" name="newPassword" type="password" autoComplete="new-password" required />
            <FormField label="Confirm new password" name="confirmNewPassword" type="password" autoComplete="new-password" required />
            <p className="text-xs text-brand-muted">
              At least 8 characters with an uppercase letter, a lowercase letter and a number.
            </p>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <SubmitButton loading={loading}>Update password</SubmitButton>
          </form>
          <a href="/forgot-password" className="mt-4 inline-block text-sm font-medium text-brand-primary hover:underline">
            Forgot your current password?
          </a>
        </section>
      </div>
    </main>
  );
}
