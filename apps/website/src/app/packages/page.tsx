'use client';

import { useEffect, useState } from 'react';

import { AuthNav } from '../../components/layout/AuthNav';
import { apiFetch } from '../../lib/api';
import { whatsappLink } from '../../lib/contact';

interface Pkg {
  _id: string;
  nameEn: string;
  price: number;
  durationDays: number;
  benefits: string[];
  isFeatured: boolean;
}


export default function PackagesPage() {
  const [pkgs, setPkgs] = useState<Pkg[] | null>(null);

  useEffect(() => {
    apiFetch<{ data: { packages: Pkg[] } }>('/monetization/packages')
      .then((r) => setPkgs(r.data.packages))
      .catch(() => setPkgs([]));
  }, []);

  return (
    <main className="min-h-screen bg-brand-surface pb-16">
      <header className="border-b border-brand-border bg-white">
        <div className="mx-auto flex w-full max-w-container items-center justify-between px-4 py-4 sm:px-8">
          <a href="/" className="text-xl font-bold text-brand-primary">SUKNA</a>
          <AuthNav />
        </div>
      </header>
      <div className="mx-auto w-full max-w-container px-4 py-10 sm:px-8">
        <h1 className="text-3xl font-bold text-brand-primary">Advertise your apartment</h1>
        <p className="mt-2 max-w-2xl text-brand-muted">
          Featured listings rank higher in search and carry a Featured badge. Pick a plan, message us, and we will activate it as soon as payment is confirmed.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pkgs === null && [0, 1, 2].map((i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-brand-primary-soft" />)}
          {pkgs?.length === 0 && <p className="text-brand-muted">Packages are coming soon.</p>}
          {pkgs?.map((p) => {
            return (
              <div key={p._id} className={`flex flex-col rounded-2xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg ${p.isFeatured ? 'border-brand-accent ring-2 ring-brand-accent/30' : 'border-brand-border'}`}>
                {p.isFeatured && <span className="mb-2 w-fit rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-brand-primary">Most popular</span>}
                <h2 className="text-xl font-bold text-brand-primary">{p.nameEn}</h2>
                <p className="mt-2 text-3xl font-bold text-brand-accent">
                  EGP {p.price.toLocaleString()}
                  <span className="text-sm font-normal text-brand-muted"> / {p.durationDays} days</span>
                </p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-brand-ink">
                  {p.benefits.map((b) => <li key={b}>&#10003; {b}</li>)}
                </ul>
                {true ? (
                  <a href={whatsappLink(`Hi SUKNA, I would like the "${p.nameEn}" advertising package.`)} target="_blank" rel="noreferrer" className="mt-6 flex h-12 cursor-pointer items-center justify-center rounded-lg bg-[#25D366] font-semibold text-white transition hover:opacity-90">
                    Order on WhatsApp
                  </a>
                ) : (
                  <p className="mt-6 text-center text-sm text-brand-muted">Contact details coming soon.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
