'use client';

import { useState } from 'react';

import { apiFetch } from '../../lib/api';
import { whatsappLink } from '../../lib/contact';

export interface OrderablePackage {
  _id: string;
  nameEn: string;
}

const fieldClass =
  'h-11 w-full rounded-xl border border-brand-border bg-white px-3 text-sm text-brand-ink outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30';

/**
 * "Order on WhatsApp" button + order modal. Records a pending order in the
 * dashboard first, then opens the WhatsApp chat. The WhatsApp conversation is
 * the fallback channel: it opens even if recording the order fails.
 */
export function OrderPackageButton({ pkg, className }: { pkg: OrderablePackage; className?: string }) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const form = new FormData(event.currentTarget);
    const ownerName = String(form.get('ownerName') ?? '').trim();
    const ownerPhone = String(form.get('ownerPhone') ?? '').trim();
    const propertyNote = String(form.get('propertyNote') ?? '').trim();
    if (ownerName.length < 2 || ownerPhone.length < 8) {
      setFormError('Add your name and a phone number we can reach you on.');
      return;
    }
    setFormError('');
    setSending(true);
    try {
      await apiFetch('/monetization/orders/public', {
        method: 'POST',
        body: JSON.stringify({
          packageId: pkg._id,
          ownerName,
          ownerPhone,
          propertyNote: propertyNote || undefined,
        }),
      });
    } catch {
      // Never block the WhatsApp conversation.
    } finally {
      setSending(false);
      window.open(
        whatsappLink(
          `Hi SUKNA, I would like the "${pkg.nameEn}" advertising package. My name is ${ownerName}.`,
        ),
        '_blank',
        'noopener',
      );
      setOpen(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setFormError('');
          setOpen(true);
        }}
        className={
          className ??
          'mt-5 flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-[#25D366] font-semibold text-white transition hover:opacity-90'
        }
      >
        Order on WhatsApp
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button aria-label="Close" className="absolute inset-0 cursor-pointer bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-3xl border border-brand-border bg-white p-6 shadow-2xl sm:p-7">
            <h2 className="text-xl font-bold text-brand-primary">Order {pkg.nameEn}</h2>
            <p className="mt-1 text-sm text-brand-muted">
              We record your order and open WhatsApp so you can confirm it with us.
            </p>
            <form onSubmit={submitOrder} className="mt-5 flex flex-col gap-4" noValidate>
              <div>
                <label htmlFor="ownerName" className="mb-1 block text-sm font-semibold text-brand-ink">
                  Your name
                </label>
                <input id="ownerName" name="ownerName" className={fieldClass} autoComplete="name" required />
              </div>
              <div>
                <label htmlFor="ownerPhone" className="mb-1 block text-sm font-semibold text-brand-ink">
                  WhatsApp number
                </label>
                <input id="ownerPhone" name="ownerPhone" className={fieldClass} autoComplete="tel" inputMode="tel" placeholder="01xxxxxxxxx" required />
              </div>
              <div>
                <label htmlFor="propertyNote" className="mb-1 block text-sm font-semibold text-brand-ink">
                  Which property? <span className="font-normal text-brand-muted">(optional)</span>
                </label>
                <input id="propertyNote" name="propertyNote" className={fieldClass} placeholder="e.g. apartment in University District, Sohag" />
              </div>
              {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
              <button
                type="submit"
                disabled={sending}
                className="flex h-12 cursor-pointer items-center justify-center rounded-xl bg-[#25D366] font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {sending ? 'Sending…' : 'Create order & open WhatsApp'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
