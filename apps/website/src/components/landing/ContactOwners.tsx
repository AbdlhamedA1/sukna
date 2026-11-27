import { whatsappLink } from '../../lib/contact';
import { Reveal } from './Reveal';

export function ContactOwners() {
  return (
    <section id="contact" className="bg-white pb-16 sm:pb-24">
      <div className="mx-auto w-full max-w-container px-4 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-primary via-[#123A5E] to-[#1E5A7A] p-8 text-white sm:p-14">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-teal/30 blur-3xl" />
            <div className="relative flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
              <div className="max-w-xl">
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Own an apartment or property?</h2>
                <p className="mt-3 text-lg text-white/80">
                  Want your place listed on SUKNA, or looking for somewhere to live and cannot find it? Message our team on WhatsApp and we will help you.
                </p>
              </div>
              <a
                href={whatsappLink('Hi SUKNA, I would like to list my property.')}
                target="_blank"
                rel="noreferrer"
                className="flex h-14 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#25D366] px-8 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:opacity-90"
              >
                Chat with us on WhatsApp
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
