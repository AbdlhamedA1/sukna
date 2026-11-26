import { HeroSearch } from '../components/locations/HeroSearch';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-brand-surface">
      <header className="mx-auto flex w-full max-w-container items-center justify-between px-4 py-5 sm:px-8">
        <span className="text-xl font-bold text-brand-primary">
          SUKNA <span className="font-arabic">سُكنا</span>
        </span>
        <nav className="flex items-center gap-2 sm:gap-3">
          <a
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary-soft sm:px-4"
          >
            Log in
          </a>
          <a
            href="/register"
            className="rounded-lg bg-brand-primary px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 sm:px-4"
          >
            Sign up
          </a>
        </nav>
      </header>

      <section className="mx-auto flex w-full max-w-container flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-8">
        <span className="mb-4 rounded-full bg-brand-primary-soft px-4 py-1 text-sm font-medium text-brand-primary">
          Qena &middot; Sohag &middot; Minya
        </span>
        <h1 className="max-w-2xl text-3xl font-bold leading-tight text-brand-primary sm:text-5xl">
          Find verified student housing in Upper Egypt
        </h1>
        <p className="mt-4 max-w-xl text-base text-brand-muted sm:text-lg">
          Every building is reviewed by our team before it appears here. Pick your area and start
          browsing.
        </p>
        <div className="mt-8 flex w-full justify-center">
          <HeroSearch />
        </div>
      </section>

      <footer className="border-t border-brand-border py-6 text-center text-sm text-brand-muted">
        SUKNA &mdash; verified housing discovery for Upper Egypt.
      </footer>
    </main>
  );
}
