import Link from 'next/link';
import { Logo } from '../../components/Logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-brand-surface lg:flex-row">
      {/* Brand panel: full-width banner on small screens, side panel on large. */}
      <aside className="relative flex flex-col items-center justify-center gap-3 bg-brand-primary px-6 py-10 text-center text-white lg:w-[42%] lg:py-0">
        <Logo variant="white" className="h-14" />
        <p className="max-w-xs text-sm text-white/80">
          Verified student and residential housing across Qena, Sohag, and Minya.
        </p>
        <span className="mt-2 rounded-full bg-white/10 px-4 py-1 text-xs font-medium">
          Qena &middot; Sohag &middot; Minya
        </span>
      </aside>

      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
