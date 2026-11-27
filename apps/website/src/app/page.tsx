import { ContactOwners } from '../components/landing/ContactOwners';
import { FeaturedHomes } from '../components/landing/FeaturedHomes';
import { Footer } from '../components/landing/Footer';
import { Hero } from '../components/landing/Hero';
import { HowItWorks } from '../components/landing/HowItWorks';
import { PackagesTeaser } from '../components/landing/PackagesTeaser';
import { WhySukna } from '../components/landing/WhySukna';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Hero />
      <FeaturedHomes />
      <HowItWorks />
      <WhySukna />
      <PackagesTeaser />
      <ContactOwners />
      <Footer />
    </main>
  );
}
