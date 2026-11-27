import { whatsappLink } from '../../lib/contact';

export function ContactOwners() {
  return (
    <section id="contact" className="bg-brand-surface py-16 sm:py-20">
      <div className="mx-auto w-full max-w-container px-4 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand-primary p-8 text-white sm:flex-row sm:items-center sm:p-12">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold sm:text-3xl">Own an apartment or property?</h2>
            <p className="mt-3 text-white/80">
              Want your place listed on SUKNA, or looking for somewhere to live and cannot find it? Message our team on WhatsApp and we will help you.
            </p>
          </div>
          <a
            href={whatsappLink('Hi SUKNA, I would like to list my property.')}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[#25D366] px-6 font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-90"
          >
            Chat with us on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
