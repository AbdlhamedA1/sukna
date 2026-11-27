'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from '../../lib/api';
import { OrderPackageButton } from '../packages/OrderPackageButton';

import { Reveal } from './Reveal';

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
    <section id="packages" className="bg-brand-canvas py-16 sm:py-24">
      <div className="mx-auto w-full max-w-container px-4 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-teal">For owners</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-brand-primary sm:text-4xl">Advertise your apartment</h2>
            <p className="mt-2 text-brand-muted">Featured listings rank higher and carry a Featured badge.</p>
          </div>
          <a href="/packages" className="rounded-full border border-brand-border bg-white px-5 py-2 text-sm font-semibold text-brand-primary shadow-sm transition hover:shadow-md">
            See all packages &rarr;
          </a>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pkgs === null && [0, 1, 2].map((i) => <div key={i} className="h-60 animate-pulse rounded-3xl bg-brand-primary-soft" />)}
          {pkgs?.slice(0, 3).map((p, i) => (
            <Reveal key={p._id} delay={i * 70}>
              <div className={`flex h-full flex-col rounded-3xl border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${p.isFeatured ? 'border-brand-accent ring-2 ring-brand-accent/30' : 'border-brand-border'}`}>
                {p.isFeatured && <span className="mb-3 w-fit rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-brand-primary">Most popular</span>}
                <h3 className="text-lg font-bold text-brand-primary">{p.nameEn}</h3>
                <p className="mt-2 text-2xl font-extrabold text-brand-accent">
                  EGP {p.price.toLocaleString()} <span className="text-sm font-normal text-brand-muted">/ {p.durationDays} days</span>
                </p>
                <ul className="mt-3 flex-1 space-y-2 text-sm text-brand-ink">
                  {p.benefits.slice(0, 4).map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span aria-hidden className="mt-0.5 font-bold text-brand-teal">&#10003;</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <OrderPackageButton pkg={p} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
