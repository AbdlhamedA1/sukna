'use client';

import { useEffect, useState } from 'react';

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

export function PackagesTeaser() {
  const [pkgs, setPkgs] = useState<Pkg[] | null>(null);
  useEffect(() => {
    apiFetch<{ data: { packages: Pkg[] } }>('/monetization/packages')
      .then((r) => setPkgs(r.data.packages))
      .catch(() => setPkgs([]));
  }, []);
  if (pkgs && pkgs.length === 0) return null;

  return (
    <section id="packages" className="bg-white py-16 sm:py-20">
      <div className="mx-auto w-full max-w-container px-4 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-brand-primary sm:text-3xl">Advertise your apartment</h2>
            <p className="mt-2 text-brand-muted">Featured listings rank higher and carry a Featured badge.</p>
          </div>
          <a href="/packages" className="rounded-lg border border-brand-border px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary-soft">
            See all packages
          </a>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pkgs === null && [0, 1, 2].map((i) => <div key={i} className="h-60 animate-pulse rounded-2xl bg-brand-primary-soft" />)}
          {pkgs?.slice(0, 3).map((p) => (
            <div key={p._id} className={`flex flex-col rounded-2xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg ${p.isFeatured ? 'border-brand-accent ring-2 ring-brand-accent/30' : 'border-brand-border'}`}>
              {p.isFeatured && <span className="mb-2 w-fit rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-brand-primary">Most popular</span>}
              <h3 className="text-lg font-bold text-brand-primary">{p.nameEn}</h3>
              <p className="mt-2 text-2xl font-bold text-brand-accent">
                EGP {p.price.toLocaleString()} <span className="text-sm font-normal text-brand-muted">/ {p.durationDays} days</span>
              </p>
              <ul className="mt-3 flex-1 space-y-1 text-sm text-brand-ink">
                {p.benefits.slice(0, 4).map((b) => <li key={b}>&#10003; {b}</li>)}
              </ul>
              <a href={whatsappLink(`Hi SUKNA, I would like the "${p.nameEn}" advertising package.`)} target="_blank" rel="noreferrer" className="mt-5 flex h-11 cursor-pointer items-center justify-center rounded-lg bg-[#25D366] font-semibold text-white transition hover:opacity-90">
                Order on WhatsApp
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
