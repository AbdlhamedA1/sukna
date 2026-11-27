import { AuthNav } from '../components/layout/AuthNav';
import { PackagesTeaser } from '../components/landing/PackagesTeaser';
import { ContactOwners } from '../components/landing/ContactOwners';
import { Footer } from '../components/landing/Footer';
import { FeaturedHomes } from '../components/landing/FeaturedHomes';
import { WhySukna } from '../components/landing/WhySukna';
import { HeroSearch } from '../components/locations/HeroSearch';
import { Logo } from '../components/Logo';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-brand-surface">
      <header className="mx-auto flex w-full max-w-container items-center justify-between px-4 py-5 sm:px-8">
        <Logo />
        <AuthNav />
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

      <FeaturedHomes />
      <WhySukna />
      <PackagesTeaser />
      <ContactOwners />
      <Footer />
    </main>
  );
}
