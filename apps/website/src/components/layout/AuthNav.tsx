'use client';

import { logoutAndGoHome, useSession } from '../../lib/session';

const link =
  'inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary-soft sm:px-4';

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function AuthNav() {
  const user = useSession();
  const favoritesLink = (
    <a href="/saved" className={link} aria-label="Favorites">
      <HeartIcon />
      <span className="hidden min-[420px]:inline">Favorites</span>
    </a>
  );
  if (user === undefined) return <nav className="h-9 w-32" aria-hidden />;
  if (user) {
    return (
      <nav className="flex items-center gap-1 sm:gap-2">
        <a href="/packages" className={`${link} hidden min-[480px]:inline-flex`}>
          Packages
        </a>
        {favoritesLink}
        <a href="/profile" className={`${link} hidden sm:inline-flex`}>
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
    <nav className="flex items-center gap-1 sm:gap-2">
      <a href="/packages" className={`${link} hidden min-[480px]:inline-flex`}>
        Packages
      </a>
      {favoritesLink}
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
