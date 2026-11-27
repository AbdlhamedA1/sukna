import { Logo } from '../Logo';

import { AuthNav } from './AuthNav';

/** Site-wide sticky header: logo + navigation, rendered from the root layout so
 * every page carries the same navigation. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-border/60 bg-white/85 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-container items-center justify-between gap-3 px-4 py-2.5 sm:px-8">
        <Logo />
        <AuthNav />
      </div>
    </header>
  );
}
