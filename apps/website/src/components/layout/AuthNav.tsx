'use client';

import { logoutAndGoHome, useSession } from '../../lib/session';

const link =
  'rounded-lg px-3 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary-soft sm:px-4';

export function AuthNav() {
  const user = useSession();
  if (user === undefined) return <nav className="h-9 w-32" aria-hidden />;
  if (user) {
    return (
      <nav className="flex items-center gap-2 sm:gap-3">
        <a href="/buildings" className={`${link} hidden sm:inline-block`}>
          Buildings
        </a>
        <a href="/saved" className={link}>
          Saved
        </a>
        <a href="/profile" className={link}>
          {user.fullName.split(' ')[0]}
        </a>
        <button
          type="button"
          onClick={logoutAndGoHome}
          className="rounded-lg bg-brand-primary px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 sm:px-4"
        >
          Log out
        </button>
      </nav>
    );
  }
  return (
    <nav className="flex items-center gap-2 sm:gap-3">
      <a href="/buildings" className={`${link} hidden sm:inline-block`}>
        Buildings
      </a>
      <a href="/login" className={link}>
        Log in
      </a>
      <a
        href="/register"
        className="rounded-lg bg-brand-primary px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 sm:px-4"
      >
        Sign up
      </a>
    </nav>
  );
}
