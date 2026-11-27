import Link from 'next/link';

import { Logo } from '../components/Logo';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-brand-surface">
      <header className="border-b border-brand-border bg-white">
        <div className="mx-auto flex w-full max-w-container items-center px-4 py-4 sm:px-8">
          <Logo />
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-container flex-1 items-center px-4 py-16 sm:px-8">
        <div className="w-full rounded-2xl border border-brand-border bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-teal">Page not found</p>
          <h1 className="mt-3 text-3xl font-extrabold text-brand-primary">This page does not exist.</h1>
          <p className="mt-3 text-brand-muted">
            The link may be old, or the home you were looking for is no longer listed.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/apartments"
              className="flex h-12 items-center justify-center rounded-lg bg-brand-accent px-6 font-semibold text-white transition hover:bg-brand-accent-hover"
            >
              Browse homes
            </Link>
            <Link
              href="/"
              className="flex h-12 items-center justify-center rounded-lg border border-brand-border px-6 font-semibold text-brand-primary transition hover:bg-brand-primary-soft"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
