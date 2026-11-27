import { Logo } from '../Logo';
export function Footer() {
  return (
    <footer className="bg-brand-primary text-white">
      <div className="mx-auto grid w-full max-w-container gap-8 px-4 py-12 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo variant="white" className="h-12" />
          <p className="mt-3 max-w-sm text-sm text-white/70">
            Verified housing discovery for Qena, Sohag and Minya.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li><a className="hover:text-white" href="/apartments">Browse homes</a></li>
            <li><a className="hover:text-white" href="/buildings">Buildings</a></li>
            <li><a className="hover:text-white" href="/packages">Advertise with us</a></li>
            <li><a className="hover:text-white" href="/#contact">List your property</a></li>
            <li><a className="hover:text-white" href="/#why">Why SUKNA</a></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Account</p>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li><a className="hover:text-white" href="/login">Log in</a></li>
            <li><a className="hover:text-white" href="/register">Sign up</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">
        &copy; {new Date().getFullYear()} SUKNA. All rights reserved.
      </div>
    </footer>
  );
}
