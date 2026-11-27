import { whatsappLink } from '../../lib/contact';
import { Logo } from '../Logo';

export function Footer() {
  return (
    <footer className="bg-brand-primary text-white">
      <div className="mx-auto grid w-full max-w-container gap-10 px-4 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo variant="white" className="h-12" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
            Verified housing discovery for Qena, Sohag and Minya. Every building is reviewed by our team
            before it goes live.
          </p>
          <a
            href={whatsappLink('Hi SUKNA!')}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden fill="currentColor">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5s.8 1.9.8 2c.1.1.1.3 0 .5l-.3.5c-.2.2-.4.4-.2.8.2.4.9 1.5 2 2.4 1.4 1.2 2.5 1.6 2.9 1.7.4.2.6.1.8-.1l1-1.2c.2-.3.4-.2.7-.1l2 .9c.3.2.5.3.6.4 0 .1 0 .6-.2 1.1Z" />
            </svg>
            Chat with us on WhatsApp
          </a>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white/90">Explore</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            <li><a className="transition hover:text-white" href="/apartments">Browse homes</a></li>
            <li><a className="transition hover:text-white" href="/packages">Advertise with us</a></li>
            <li><a className="transition hover:text-white" href="/saved">Favorites</a></li>
            <li><a className="transition hover:text-white" href="/#why">Why SUKNA</a></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white/90">Account</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/70">
            <li><a className="transition hover:text-white" href="/login">Log in</a></li>
            <li><a className="transition hover:text-white" href="/register">Sign up</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">
        &copy; {new Date().getFullYear()} SUKNA. All rights reserved.
      </div>
    </footer>
  );
}
