import { BuildingsStrip } from '../components/landing/BuildingsStrip';
import { ContactOwners } from '../components/landing/ContactOwners';
import { FeaturedHomes } from '../components/landing/FeaturedHomes';
import { Footer } from '../components/landing/Footer';
import { Hero } from '../components/landing/Hero';
import { HowItWorks } from '../components/landing/HowItWorks';
import { PackagesTeaser } from '../components/landing/PackagesTeaser';
import { WhySukna } from '../components/landing/WhySukna';
import { AuthNav } from '../components/layout/AuthNav';
import { Logo } from '../components/Logo';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-40 border-b border-brand-border/60 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-container items-center justify-between px-4 py-3 sm:px-8">
          <Logo />
          <AuthNav />
        </div>
      </header>
      <Hero />
      <FeaturedHomes />
      <BuildingsStrip />
      <HowItWorks />
      <WhySukna />
      <PackagesTeaser />
      <ContactOwners />
      <Footer />
    </main>
  );
}
