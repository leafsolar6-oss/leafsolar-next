'use client';

import { useState } from 'react';
import type { SolarPackage } from '@/lib/data';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm({ initialPkg, initialProduct, packages }: { initialPkg: string; initialProduct: string; packages: SolarPackage[] }) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setError('');

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Your message could not be sent.');
      setStatus('sent');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong. Please try WhatsApp instead.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-3xl border border-leaf-100 bg-leaf-50 p-8 text-center md:p-12" role="status">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-leaf-600 text-2xl text-white">✓</div>
        <h2 className="mt-5 font-display text-2xl font-bold">Message received</h2>
        <p className="mt-2 text-gray-600">Thank you. A member of the Leaf Solar team will contact you as soon as possible during business hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/40 md:p-9">
      <div>
        <p className="eyebrow">Send an enquiry</p>
        <h2 className="mt-2 font-display text-2xl font-bold">How can we help?</h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Full name" name="name" autoComplete="name" required />
        <Field label="Phone number" name="phone" type="tel" autoComplete="tel" required />
      </div>
      <Field label="Email address" name="email" type="email" autoComplete="email" />

      <div>
        <label htmlFor="pkg" className="mb-1.5 block text-sm font-semibold">Interested in</label>
        <select id="pkg" name="pkg" defaultValue={initialPkg} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900">
          <option value="">General enquiry</option>
          <option value="appliances">Home appliances</option>
          <option value="solar-equipment">Solar equipment</option>
          {packages.map(packageItem => <option key={packageItem.slug} value={packageItem.slug}>{packageItem.name} — {packageItem.capacity}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-semibold">Message</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          defaultValue={initialProduct ? `I am interested in the ${initialProduct}. Please confirm availability.` : ''}
          className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3.5"
          placeholder="Tell us what you want to power, the product you need, or how we can help…"
        />
      </div>

      {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>}

      <button disabled={status === 'sending'} className="btn btn-primary w-full disabled:cursor-wait disabled:opacity-60">
        {status === 'sending' ? 'Sending message…' : 'Send message'}
      </button>
      <p className="text-center text-xs text-gray-500">Your details are only used to respond to this enquiry.</p>
    </form>
  );
}

function Field({ label, name, type = 'text', required, autoComplete }: { label: string; name: string; type?: string; required?: boolean; autoComplete?: string }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold">
        {label}{required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
      </label>
      <input id={name} required={required} name={name} type={type} autoComplete={autoComplete} className="w-full rounded-xl border border-gray-300 px-4 py-3.5" />
    </div>
  );
}
