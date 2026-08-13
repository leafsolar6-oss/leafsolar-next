'use client';
import { useState } from 'react';
import { packages } from '@/lib/data';

export default function ContactForm({ initialPkg }: { initialPkg: string }) {
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle');
  const [error, setError] = useState('');
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending'); setError('');
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Send failed');
      setStatus('sent');
    } catch (err: any) {
      setError(err.message || 'Something went wrong'); setStatus('error');
    }
  }
  if (status === 'sent') {
    return (
      <div className="rounded-2xl bg-leaf-50 border border-leaf-200 p-8 text-center">
        <div className="text-4xl">✅</div>
        <h2 className="font-display text-2xl font-bold mt-3">Message received!</h2>
        <p className="text-gray-700 mt-2">An engineer will reach out within one business hour.</p>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border p-6 md:p-8 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full name" name="name" required />
        <Field label="Phone" name="phone" type="tel" required />
      </div>
      <Field label="Email" name="email" type="email" />
      <div>
        <label className="block text-sm font-semibold mb-1.5">Interested in</label>
        <select name="pkg" defaultValue={initialPkg} className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white">
          <option value="">Just browsing</option>
          {packages.map(p => <option key={p.slug} value={p.slug}>{p.name} — {p.capacity}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1.5">Message</label>
        <textarea name="message" rows={4} className="w-full rounded-xl border border-gray-300 px-4 py-3" placeholder="Tell us about your home or load…"/>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <button disabled={status==='sending'} className="btn btn-primary w-full disabled:opacity-60">
        {status==='sending' ? 'Sending…' : 'Send message'}
      </button>
      <p className="text-xs text-gray-500">We&apos;ll never share your number. Reply typically within 1 hour, 8am–8pm WAT.</p>
    </form>
  );
}

function Field({ label, name, type='text', required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5">{label}{required && <span className="text-red-500">*</span>}</label>
      <input required={required} name={name} type={type} className="w-full rounded-xl border border-gray-300 px-4 py-3"/>
    </div>
  );
}
