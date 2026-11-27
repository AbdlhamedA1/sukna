'use client';

import { useEffect, useState } from 'react';

import { OrderPackageButton } from '../../components/packages/OrderPackageButton';
import { apiFetch } from '../../lib/api';

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
    <main className="min-h-screen bg-brand-canvas pb-20">
      <div className="mx-auto w-full max-w-container px-4 py-12 sm:px-8 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-widest text-brand-teal">For owners</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-brand-primary sm:text-4xl">
            Advertise your apartment
          </h1>
          <p className="mt-3 leading-relaxed text-brand-muted">
            Featured listings rank higher in search and carry a Featured badge. Pick a plan, message us on
            WhatsApp, and we activate it as soon as payment is confirmed.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pkgs === null && [0, 1, 2].map((i) => <div key={i} className="h-72 animate-pulse rounded-3xl bg-brand-primary-soft" />)}
          {pkgs?.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-brand-border bg-white p-10 text-center">
              <p className="font-semibold text-brand-ink">Packages are coming soon.</p>
              <p className="mt-1 text-sm text-brand-muted">Check back shortly, or message us on WhatsApp.</p>
            </div>
          )}
          {pkgs?.map((p) => (
            <div
              key={p._id}
              className={`flex flex-col rounded-3xl border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${p.isFeatured ? 'border-brand-accent ring-2 ring-brand-accent/30' : 'border-brand-border'}`}
            >
              {p.isFeatured && (
                <span className="mb-3 w-fit rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-brand-primary">
                  Most popular
                </span>
              )}
              <h2 className="text-xl font-bold text-brand-primary">{p.nameEn}</h2>
              <p className="mt-2 text-3xl font-extrabold text-brand-accent">
                EGP {p.price.toLocaleString()}
                <span className="text-sm font-normal text-brand-muted"> / {p.durationDays} days</span>
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-brand-ink">
                {p.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span aria-hidden className="mt-0.5 font-bold text-brand-teal">&#10003;</span>
                    {b}
                  </li>
                ))}
              </ul>
              <OrderPackageButton pkg={p} className="mt-6 flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[#25D366] font-semibold text-white transition hover:opacity-90" />
            </div>
          ))}
        </div>

        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-brand-muted">
          No online payments: your order is recorded, we agree on the details on WhatsApp, and your listing goes
          live as soon as payment is confirmed.
        </p>
      </div>
    </main>
  );
}
